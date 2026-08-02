import { Routes } from '@angular/router';
import { customerAuthGuard } from './guards/customer-auth.guard';
import { customerOrderWorkflowGuard } from './guards/customer-order-workflow.guard';
import { redirectIfAuthenticatedGuard } from './guards/redirect-if-authenticated.guard';
export const routes: Routes = [
  { path:'',pathMatch:'full',redirectTo:'splash' },
  { path:'splash',canActivate:[redirectIfAuthenticatedGuard],loadComponent:()=>import('./pages/splash.page').then(m=>m.SplashPage) },
  { path:'login',canActivate:[redirectIfAuthenticatedGuard],loadComponent:()=>import('./pages/login.page').then(m=>m.LoginPage) },
  { path:'verification',loadComponent:()=>import('./pages/verification.page').then(m=>m.VerificationPage) },
  { path:'',canActivateChild:[customerAuthGuard],children:[
    { path:'home',loadComponent:()=>import('./pages/home.page').then(m=>m.HomePage) },
    { path:'new-order',loadComponent:()=>import('./pages/new-order.page').then(m=>m.NewOrderPage) },
    { path:'select-location',loadComponent:()=>import('./pages/select-location.page').then(m=>m.SelectLocationPage) },
    { path:'select-equipment',loadComponent:()=>import('./pages/select-equipment.page').then(m=>m.SelectEquipmentPage) },
    { path:'order-details',canActivate:[customerOrderWorkflowGuard],data:{orderStep:'details'},loadComponent:()=>import('./pages/order-details.page').then(m=>m.OrderDetailsPage) },
    { path:'schedule-delivery',canActivate:[customerOrderWorkflowGuard],data:{orderStep:'schedule'},loadComponent:()=>import('./pages/schedule-delivery.page').then(m=>m.ScheduleDeliveryPage) },
    { path:'order-review',canActivate:[customerOrderWorkflowGuard],data:{orderStep:'review'},loadComponent:()=>import('./pages/order-review.page').then(m=>m.OrderReviewPage) },
    { path:'order-confirmation/:id',loadComponent:()=>import('./pages/order-confirmation.page').then(m=>m.OrderConfirmationPage) },
    { path:'orders',loadComponent:()=>import('./pages/orders.page').then(m=>m.OrdersPage) },
    { path:'order-status/:id',loadComponent:()=>import('./pages/order-status.page').then(m=>m.OrderStatusPage) },
    { path:'live-tracking/:id',loadComponent:()=>import('./pages/live-tracking.page').then(m=>m.LiveTrackingPage) },
    { path:'equipment',loadComponent:()=>import('./pages/equipment.page').then(m=>m.EquipmentPage) },
    { path:'equipment-detail/:id',loadComponent:()=>import('./pages/equipment-detail.page').then(m=>m.EquipmentDetailPage) },
    { path:'equipment-form',loadComponent:()=>import('./pages/equipment-form.page').then(m=>m.EquipmentFormPage) },
    { path:'equipment-form/:id',loadComponent:()=>import('./pages/equipment-form.page').then(m=>m.EquipmentFormPage) },
    { path:'locations',loadComponent:()=>import('./pages/locations.page').then(m=>m.LocationsPage) },
    { path:'location-form',loadComponent:()=>import('./pages/location-form.page').then(m=>m.LocationFormPage) },
    { path:'location-form/:id',loadComponent:()=>import('./pages/location-form.page').then(m=>m.LocationFormPage) },
    { path:'deliveries',loadComponent:()=>import('./pages/deliveries.page').then(m=>m.DeliveriesPage) },
    { path:'delivery-detail/:id',loadComponent:()=>import('./pages/delivery-detail.page').then(m=>m.DeliveryDetailPage) },
    { path:'invoices',loadComponent:()=>import('./pages/invoices.page').then(m=>m.InvoicesPage) },
    { path:'invoice-detail/:id',loadComponent:()=>import('./pages/invoice-detail.page').then(m=>m.InvoiceDetailPage) },
    { path:'notifications',loadComponent:()=>import('./pages/notifications.page').then(m=>m.NotificationsPage) },
    { path:'profile',loadComponent:()=>import('./pages/profile.page').then(m=>m.ProfilePage) },
  ]},
  { path:'**',redirectTo:'home' }
];
