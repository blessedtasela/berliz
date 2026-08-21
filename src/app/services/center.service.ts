import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ApiResponse } from '../models/Api.interface';
import {
  Centers,
  CenterLikes,
  CenterAnnouncements,
  CenterEquipment,
  CenterIntroduction,
  CenterLocations,
  CenterPhotoAlbum,
  CenterPricing,
  CenterTrainers,
  CenterVideoAlbum,
  CenterReviews,
} from '../models/centers.interface';

@Injectable({ providedIn: 'root' })
export class CenterService {

  url = environment.api;

  constructor(private http: HttpClient) { }

  // =========================================================================
  // CENTER CRUD
  // =========================================================================

  getAllCenters(): Observable<ApiResponse<Centers[]>> {
    return this.http.get<ApiResponse<Centers[]>>(`${this.url}/center/get`);
  }

  getActiveCenters(): Observable<ApiResponse<Centers[]>> {
    return this.http.get<ApiResponse<Centers[]>>(`${this.url}/center/getActiveCenters`);
  }

  getCenter(): Observable<ApiResponse<Centers>> {
    return this.http.get<ApiResponse<Centers>>(`${this.url}/center/getCenter`);
  }

  getCenterByUserId(userId: number): Observable<ApiResponse<Centers>> {
    return this.http.get<ApiResponse<Centers>>(`${this.url}/center/getByUserId/${userId}`);
  }

  addCenter(data: any): Observable<ApiResponse<Centers>> {
    return this.http.post<ApiResponse<Centers>>(`${this.url}/center/add`, data);
  }

  updateCenter(data: any): Observable<ApiResponse<Centers>> {
    return this.http.put<ApiResponse<Centers>>(`${this.url}/center/update`, data);
  }

  updateCenterPhoto(data: any): Observable<ApiResponse<Centers>> {
    return this.http.put<ApiResponse<Centers>>(`${this.url}/center/updatePhoto`, data);
  }

  updateCenterStatus(id: number): Observable<ApiResponse<Centers>> {
    return this.http.put<ApiResponse<Centers>>(`${this.url}/center/updateStatus/${id}`, {});
  }

  likeCenter(id: number): Observable<ApiResponse<Centers>> {
    return this.http.put<ApiResponse<Centers>>(`${this.url}/center/like/${id}`, {});
  }

  deleteCenter(id: number): Observable<ApiResponse<string>> {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/delete/${id}`);
  }

  getCenterLikes(): Observable<ApiResponse<CenterLikes[]>> {
    return this.http.get<ApiResponse<CenterLikes[]>>(`${this.url}/center/getCenterLikes`);
  }

  updateMyCenterTrainers(data: any): Observable<ApiResponse<string>> {
    return this.http.put<ApiResponse<string>>(`${this.url}/center/updateMyCenterTrainers`, data);
  }
  // =========================================================================
  // ANNOUNCEMENTS
  // =========================================================================

  getAllAnnouncements() {
    return this.http.get<ApiResponse<CenterAnnouncements[]>>(`${this.url}/center/getAllCenterAnnouncements`);
  }

  getMyAnnouncements() {
    return this.http.get<ApiResponse<CenterAnnouncements[]>>(`${this.url}/center/getMyCenterAnnouncements`);
  }

  getActiveAnnouncements(id: number) {
    return this.http.get<ApiResponse<CenterAnnouncements[]>>(`${this.url}/center/getActiveCenterAnnouncements/${id}`);
  }

  addAnnouncement(data: any) {
    return this.http.post<ApiResponse<CenterAnnouncements>>(`${this.url}/center/addCenterAnnouncement`, data);
  }

  updateAnnouncement(data: any) {
    return this.http.put<ApiResponse<CenterAnnouncements>>(`${this.url}/center/updateCenterAnnouncement`, data);
  }

  updateAnnouncementStatus(id: number) {
    return this.http.put<ApiResponse<CenterAnnouncements>>(`${this.url}/center/updateCenterAnnouncementStatus/${id}`, {});
  }

  deleteAnnouncement(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterAnnouncement/${id}`);
  }


  /// =========================================================================
  // EQUIPMENT
  // =========================================================================

  getAllEquipment() {
    return this.http.get<ApiResponse<CenterEquipment[]>>(`${this.url}/center/getAllCenterEquipments`);
  }

  getMyEquipment() {
    return this.http.get<ApiResponse<CenterEquipment[]>>(`${this.url}/center/getMyCenterEquipments`);
  }

  /** Public: this one center's equipment, no auth required — for its public profile page. */
  getEquipmentByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterEquipment[]>>(`${this.url}/center/getCenterEquipments/${centerId}`);
  }

  addEquipment(data: any) {
    return this.http.post<ApiResponse<CenterEquipment>>(`${this.url}/center/addCenterEquipment`, data);
  }

  updateEquipment(data: any) {
    return this.http.put<ApiResponse<CenterEquipment>>(`${this.url}/center/updateCenterEquipment`, data);
  }

  deleteEquipment(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterEquipment/${id}`);
  }


  // =========================================================================
  // INTRODUCTIONS
  // =========================================================================

  getAllIntroductions() {
    return this.http.get<ApiResponse<CenterIntroduction[]>>(`${this.url}/center/getAllCenterIntroductions`);
  }

  getMyIntroductions() {
    return this.http.get<ApiResponse<CenterIntroduction[]>>(`${this.url}/center/getMyCenterIntroductions`);
  }

  /** Public: this one center's introductions, no auth required — for its public profile page. */
  getIntroductionsByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterIntroduction[]>>(`${this.url}/center/getCenterIntroductions/${centerId}`);
  }

  addIntroduction(data: any) {
    return this.http.post<ApiResponse<CenterIntroduction>>(`${this.url}/center/addCenterIntroduction`, data);
  }

  updateIntroduction(data: any) {
    return this.http.put<ApiResponse<CenterIntroduction>>(`${this.url}/center/updateCenterIntroduction`, data);
  }

  deleteIntroduction(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterIntroduction/${id}`);
  }


  // =========================================================================
  // LOCATIONS
  // =========================================================================

  getAllLocations() {
    return this.http.get<ApiResponse<CenterLocations[]>>(`${this.url}/center/getAllCenterLocations`);
  }

  getMyLocations() {
    return this.http.get<ApiResponse<CenterLocations[]>>(`${this.url}/center/getMyCenterLocations`);
  }

  /** Public: this one center's locations, no auth required — for its public profile page. */
  getLocationsByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterLocations[]>>(`${this.url}/center/getCenterLocations/${centerId}`);
  }

  addLocation(data: any) {
    return this.http.post<ApiResponse<CenterLocations>>(`${this.url}/center/addCenterLocation`, data);
  }

  updateLocation(data: any) {
    return this.http.put<ApiResponse<CenterLocations>>(`${this.url}/center/updateCenterLocation`, data);
  }

  deleteLocation(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterLocation/${id}`);
  }


  // =========================================================================
  // PHOTO ALBUMS
  // =========================================================================

  getAllPhotoAlbums() {
    return this.http.get<ApiResponse<CenterPhotoAlbum[]>>(`${this.url}/center/getAllCenterPhotoAlbums`);
  }

  getMyPhotoAlbums() {
    return this.http.get<ApiResponse<CenterPhotoAlbum[]>>(`${this.url}/center/getMyCenterPhotoAlbums`);
  }

  /** Public: this one center's photo albums, no auth required — for its public profile page. */
  getPhotoAlbumsByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterPhotoAlbum[]>>(`${this.url}/center/getCenterPhotoAlbums/${centerId}`);
  }

  addPhotoAlbum(data: any) {
    return this.http.post<ApiResponse<CenterPhotoAlbum>>(`${this.url}/center/addCenterPhotoAlbum`, data);
  }

  updatePhotoAlbum(data: any) {
    return this.http.put<ApiResponse<CenterPhotoAlbum>>(`${this.url}/center/updateCenterPhotoAlbum`, data);
  }

  deletePhotoAlbum(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterPhotoAlbum/${id}`);
  }

  // =========================================================================
  // PRICING
  // =========================================================================

  getAllPricing() {
    return this.http.get<ApiResponse<CenterPricing[]>>(`${this.url}/center/getAllCenterPricing`);
  }

  getMyPricing() {
    return this.http.get<ApiResponse<CenterPricing>>(`${this.url}/center/getMyCenterPricing`);
  }

  /** Public: this one center's pricing, no auth required — for its public profile page. */
  getPricingByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterPricing>>(`${this.url}/center/getCenterPricing/${centerId}`);
  }

  addPricing(data: any) {
    return this.http.post<ApiResponse<CenterPricing>>(`${this.url}/center/addCenterPricing`, data);
  }

  updatePricing(data: any) {
    return this.http.put<ApiResponse<CenterPricing>>(`${this.url}/center/updateCenterPricing`, data);
  }

  deletePricing(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterPricing/${id}`);
  }

  // =========================================================================
  // CENTER TRAINERS
  // =========================================================================

  getAllCenterTrainers() {
    return this.http.get<ApiResponse<CenterTrainers[]>>(`${this.url}/center/getAllCenterTrainers`);
  }

  /** Public: this one center's trainer roster, no auth required — for its public profile page. */
  getCenterTrainersByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterTrainers[]>>(`${this.url}/center/getCenterTrainers/${centerId}`);
  }

  getMyCenterTrainers() {
    return this.http.get<ApiResponse<CenterTrainers[]>>(`${this.url}/center/getMyCenterTrainers`);
  }

  addCenterTrainer(data: any) {
    return this.http.post<ApiResponse<CenterTrainers>>(`${this.url}/center/addCenterTrainer`, data);
  }

  updateCenterTrainerStatus(id: number) {
    return this.http.put<ApiResponse<CenterTrainers>>(`${this.url}/center/updateCenterTrainerStatus/${id}`, {});
  }

  deleteCenterTrainer(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterTrainer/${id}`);
  }

  // =========================================================================
  // VIDEO ALBUMS
  // =========================================================================

  getAllVideoAlbums() {
    return this.http.get<ApiResponse<CenterVideoAlbum[]>>(`${this.url}/center/getAllCenterVideoAlbums`);
  }

  getMyVideoAlbums() {
    return this.http.get<ApiResponse<CenterVideoAlbum[]>>(`${this.url}/center/getMyCenterVideoAlbums`);
  }

  /** Public: this one center's video albums, no auth required — for its public profile page. */
  getVideoAlbumsByCenterId(centerId: number) {
    return this.http.get<ApiResponse<CenterVideoAlbum[]>>(`${this.url}/center/getCenterVideoAlbums/${centerId}`);
  }

  addVideoAlbum(data: any) {
    return this.http.post<ApiResponse<CenterVideoAlbum>>(`${this.url}/center/addCenterVideoAlbum`, data);
  }

  updateVideoAlbum(data: any) {
    return this.http.put<ApiResponse<CenterVideoAlbum>>(`${this.url}/center/updateCenterVideoAlbum`, data);
  }

  deleteVideoAlbum(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterVideoAlbum/${id}`);
  }


  // =========================================================================
  // REVIEWS
  // =========================================================================

  getAllReviews() {
    return this.http.get<ApiResponse<CenterReviews[]>>(`${this.url}/center/getAllCenterReviews`);
  }

  getMyReviews() {
    return this.http.get<ApiResponse<CenterReviews[]>>(`${this.url}/center/getMyCenterReviews`);
  }

  getActiveReviews(id: number) {
    return this.http.get<ApiResponse<CenterReviews[]>>(`${this.url}/center/getActiveCenterReviews/${id}`);
  }

  addReview(data: any) {
    return this.http.post<ApiResponse<CenterReviews>>(`${this.url}/center/addCenterReview`, data);
  }

  updateReview(data: any) {
    return this.http.put<ApiResponse<CenterReviews>>(`${this.url}/center/updateCenterReview`, data);
  }

  updateReviewStatus(id: number) {
    return this.http.put<ApiResponse<CenterReviews>>(`${this.url}/center/updateCenterReviewStatus/${id}`, {});
  }

  disableReview(id: number) {
    return this.http.put<ApiResponse<CenterReviews>>(`${this.url}/center/disableCenterReview/${id}`, {});
  }

  deleteReview(id: number) {
    return this.http.delete<ApiResponse<string>>(`${this.url}/center/deleteCenterReview/${id}`);
  }

}
