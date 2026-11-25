import { DatePipe } from '@angular/common';
import type { ElementRef, OnDestroy } from '@angular/core';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { GoogleMap, LatLngBounds } from '@capacitor/google-maps';
import type { Marker } from '@capacitor/google-maps';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { addIcons } from 'ionicons';
import { calendarOutline, checkmarkCircle, close, ellipseOutline, navigateOutline } from 'ionicons/icons';

import { environment } from '../../../../environments/environment';
import { LanguageService } from '../../../core/i18n/language.service';
import { distanceInMeters } from '../../../shared/native/geo';
import type { GeoPoint } from '../../../shared/native/location.service';
import { AppLocation, LocationPermissionError } from '../../../shared/native/location.service';
import { AppToast } from '../../../shared/ui/app-toast.service';
import { TodoStore } from '../../data/todo.store';
import { TODO_CATEGORIES, TODO_CATEGORY_META } from '../../todo-category';
import type { Todo, TodoLocation } from '../../todo.model';

export const NEARBY_RADIUS_M = 1000;

const MAP_ID = 'todos-map';
const DEFAULT_CAMERA = { center: { lat: 48.38, lng: 31.17 }, zoom: 5 };
const SINGLE_TODO_ZOOM = 15;
const NEARBY_ZOOM = 14;
const FIT_PADDING = 64;
const MARKER_SIZE = { width: 32, height: 40 };
const MARKER_ANCHOR = { x: 16, y: 40 };
const MAP_ACTIVE_CLASS = 'map-page-active';
const USER_MARKER_URL = 'assets/markers/me.png';
const USER_MARKER_SIZE = { width: 24, height: 24 };
const USER_MARKER_ANCHOR = { x: 12, y: 12 };

type LocatedTodo = Todo & { readonly location: TodoLocation };

function mapsApiKey(): string {
  const platform = Capacitor.getPlatform();
  return platform === 'ios' || platform === 'android' ? environment.googleMaps[platform] : environment.googleMaps.web;
}

function boundsOf(points: readonly TodoLocation[]): LatLngBounds {
  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const southwest = { lat: Math.min(...lats), lng: Math.min(...lngs) };
  const northeast = { lat: Math.max(...lats), lng: Math.max(...lngs) };
  const center = { lat: (southwest.lat + northeast.lat) / 2, lng: (southwest.lng + northeast.lng) / 2 };
  return new LatLngBounds({ southwest, northeast, center });
}

@Component({
  selector: 'app-todo-map',
  templateUrl: './todo-map.page.html',
  imports: [
    DatePipe,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonButton,
    IonIcon,
    IonSpinner,
    IonContent,
    TranslatePipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TodoMapPage implements OnDestroy {
  private readonly store = inject(TodoStore);
  private readonly geolocation = inject(AppLocation);
  private readonly toast = inject(AppToast);
  private readonly translate = inject(TranslateService);
  protected readonly language = inject(LanguageService);

  private readonly mapElement = viewChild.required<ElementRef<HTMLElement>>('mapElement');
  private map: GoogleMap | null = null;
  private markerIds: string[] = [];
  private circleIds: string[] = [];
  private readonly markerTodos = new Map<string, LocatedTodo>();
  private renderQueue: Promise<void> = Promise.resolve();

  protected readonly categories = TODO_CATEGORIES;
  protected readonly categoryMeta = TODO_CATEGORY_META;
  protected readonly nearbyRadiusKm = NEARBY_RADIUS_M / 1000;
  protected readonly ready = signal(false);
  protected readonly nearbyOnly = signal(false);
  protected readonly locating = signal(false);
  protected readonly userLocation = signal<GeoPoint | null>(null);
  protected readonly selected = signal<LocatedTodo | null>(null);

  protected readonly locatedTodos = computed(() =>
    this.store.todos().filter((todo): todo is LocatedTodo => todo.location !== null),
  );
  protected readonly visibleTodos = computed(() => {
    const todos = this.locatedTodos();
    const user = this.userLocation();
    return this.nearbyOnly() && user
      ? todos.filter((todo) => distanceInMeters(user, todo.location) <= NEARBY_RADIUS_M)
      : todos;
  });

  constructor() {
    addIcons({ calendarOutline, checkmarkCircle, close, ellipseOutline, navigateOutline });
    effect(() => {
      const todos = this.visibleTodos();
      const center = this.nearbyOnly() ? this.userLocation() : null;
      if (this.ready()) {
        this.enqueue(() => this.render(todos, center));
      }
    });
    effect(() => {
      const selected = this.selected();
      if (selected && !this.visibleTodos().some((todo) => todo.id === selected.id)) {
        this.selected.set(null);
      }
    });
  }

  async ionViewDidEnter(): Promise<void> {
    document.body.classList.add(MAP_ACTIVE_CLASS);
    if (!this.map) {
      await this.createMap();
    }
  }

  ionViewWillLeave(): void {
    document.body.classList.remove(MAP_ACTIVE_CLASS);
  }

  ngOnDestroy(): void {
    document.body.classList.remove(MAP_ACTIVE_CLASS);
    void this.map?.destroy();
    this.map = null;
  }

  protected async toggleNearby(): Promise<void> {
    if (this.nearbyOnly()) {
      this.nearbyOnly.set(false);
      return;
    }
    this.locating.set(true);
    try {
      this.userLocation.set(await this.geolocation.current());
      this.nearbyOnly.set(true);
    } catch (error) {
      await this.toast.error(
        error instanceof LocationPermissionError ? 'location.errors.denied' : 'location.errors.failed',
      );
    } finally {
      this.locating.set(false);
    }
  }

  protected closeInfo(): void {
    this.selected.set(null);
  }

  private async createMap(): Promise<void> {
    const map = await GoogleMap.create({
      id: MAP_ID,
      element: this.mapElement().nativeElement,
      apiKey: mapsApiKey(),
      language: this.language.current(),
      forceCreate: true,
      config: { ...DEFAULT_CAMERA, disableDefaultUI: true, zoomControl: true, clickableIcons: false },
    });
    await map.setOnMarkerClickListener(({ markerId }) => this.selected.set(this.markerTodos.get(markerId) ?? null));
    await map.setOnMapClickListener(() => this.selected.set(null));
    this.map = map;
    this.ready.set(true);
  }

  private enqueue(task: () => Promise<void>): void {
    this.renderQueue = this.renderQueue.then(task).catch(() => undefined);
  }

  private async render(todos: readonly LocatedTodo[], nearbyCenter: GeoPoint | null): Promise<void> {
    const map = this.map;
    if (!map) {
      return;
    }
    if (this.markerIds.length) {
      await map.removeMarkers(this.markerIds);
    }
    if (this.circleIds.length) {
      await map.removeCircles(this.circleIds);
    }
    this.markerTodos.clear();

    const markers: Marker[] = todos.map((todo) => ({
      coordinate: { lat: todo.location.lat, lng: todo.location.lng },
      title: todo.title,
      snippet: todo.description,
      iconUrl: TODO_CATEGORY_META[todo.category].markerUrl,
      iconSize: MARKER_SIZE,
      iconAnchor: MARKER_ANCHOR,
      zIndex: todo.completed ? 0 : 1,
      opacity: todo.completed ? 0.55 : 1,
    }));
    if (nearbyCenter) {
      markers.push({
        coordinate: { lat: nearbyCenter.lat, lng: nearbyCenter.lng },
        title: this.translate.instant('map.you'),
        iconUrl: USER_MARKER_URL,
        iconSize: USER_MARKER_SIZE,
        iconAnchor: USER_MARKER_ANCHOR,
        zIndex: 2,
      });
    }
    this.markerIds = markers.length ? await map.addMarkers(markers) : [];
    todos.forEach((todo, index) => this.markerTodos.set(this.markerIds[index], todo));

    if (nearbyCenter) {
      this.circleIds = await map.addCircles([
        {
          center: { lat: nearbyCenter.lat, lng: nearbyCenter.lng },
          radius: NEARBY_RADIUS_M,
          fillColor: '#0070f3',
          fillOpacity: 0.08,
          strokeColor: '#0070f3',
          strokeWeight: 1,
          clickable: false,
        },
      ]);
      await map.setCamera({
        coordinate: { lat: nearbyCenter.lat, lng: nearbyCenter.lng },
        zoom: NEARBY_ZOOM,
        animate: true,
      });
      return;
    }
    this.circleIds = [];
    if (todos.length === 1) {
      await map.setCamera({ coordinate: todos[0].location, zoom: SINGLE_TODO_ZOOM, animate: true });
    } else if (todos.length > 1) {
      await map.fitBounds(boundsOf(todos.map((todo) => todo.location)), FIT_PADDING);
    }
  }
}
