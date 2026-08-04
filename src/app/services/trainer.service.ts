import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, EventEmitter } from '@angular/core';
import { environment } from 'src/environments/environment';

import {
  Trainers,
  TrainerBenefits,
  TrainerClients,
  TrainerFeatureVideo,
  TrainerIntroduction,
  TrainerPhotoAlbum,
  TrainerPricing,
  TrainerReview,
  TrainerReviewLikes,
  TrainerSubscription,
  TrainerTestimonials,
  TrainerVideoAlbum,
  TrainerLikes,
} from '../models/trainers.interface';

import { CenterTrainers } from '../models/centers.interface';
import { ApiResponse } from '../models/Api.interface';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {

  url = environment.api;
  trainerEventEmitter = new EventEmitter();

  constructor(private httpClient: HttpClient) { }

  // ─────────────────────────────
  // TRAINERS
  // ─────────────────────────────

  addTrainer(data: any) {
    return this.httpClient.post<ApiResponse<Trainers>>(`${this.url}/trainer/add`, data);
  }

  getAllTrainers() {
    return this.httpClient.get<ApiResponse<Trainers[]>>(`${this.url}/trainer/get`);
  }

  getActiveTrainers() {
    return this.httpClient.get<ApiResponse<Trainers[]>>(`${this.url}/trainer/getActiveTrainers`);
  }

  updateTrainer(data: any) {
    return this.httpClient.put<ApiResponse<Trainers>>(`${this.url}/trainer/update`, data);
  }

  updateTrainerPhoto(data: any) {
    return this.httpClient.put<ApiResponse<Trainers>>(`${this.url}/trainer/updateTrainerPhoto`, data);
  }

  deleteTrainer(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/delete/${id}`);
  }

  deleteMyTrainerProfile(confirmationKeyword: string) {
    return this.httpClient.delete<ApiResponse<void>>(
      `${this.url}/trainer/deleteMyTrainerProfile/${confirmationKeyword}`);
  }

  updateTrainerStatus(id: number) {
    return this.httpClient.put<ApiResponse<Trainers>>(
      `${this.url}/trainer/updateTrainerStatus/${id}`, null);
  }

  getTrainer() {
    return this.httpClient.get<ApiResponse<Trainers>>(`${this.url}/trainer/getTrainer`);
  }

  likeTrainer(id: number) {
    return this.httpClient.put<ApiResponse<Trainers>>(`${this.url}/trainer/like/${id}`, null);
  }

  getTrainerLikes() {
    return this.httpClient.get<ApiResponse<TrainerLikes[]>>(`${this.url}/trainer/getTrainerLikes`);
  }

  getMyTrainerLikes() {
    return this.httpClient.get<ApiResponse<TrainerLikes[]>>(`${this.url}/trainer/getMyTrainerLikes`);
  }

  getAllTrainerLikes() {
    return this.httpClient.get<ApiResponse<TrainerLikes[]>>(`${this.url}/trainer/getAllTrainerLikes`);
  }

  // ─────────────────────────────
  // PRICING
  // ─────────────────────────────

  addTrainerPricing(data: any) {
    return this.httpClient.post<ApiResponse<TrainerPricing>>(`${this.url}/trainer/addTrainerPricing`, data);
  }

  updateTrainerPricing(data: any) {
    return this.httpClient.put<ApiResponse<TrainerPricing>>(`${this.url}/trainer/updateTrainerPricing`, data);
  }

  getAllTrainerPricing() {
    return this.httpClient.get<ApiResponse<TrainerPricing[]>>(`${this.url}/trainer/getAllTrainerPricing`);
  }

  getMyTrainerPricing() {
    return this.httpClient.get<ApiResponse<TrainerPricing>>(`${this.url}/trainer/getMyTrainerPricing`);
  }

  deleteTrainerPricing(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerPricing/${id}`);
  }

  // ─────────────────────────────
  // INTRODUCTION
  // ─────────────────────────────

  addTrainerIntroduction(data: any) {
    return this.httpClient.post<ApiResponse<TrainerIntroduction>>(`${this.url}/trainer/addTrainerIntroduction`, data);
  }

  updateTrainerIntroduction(data: any) {
    return this.httpClient.put<ApiResponse<TrainerIntroduction>>(`${this.url}/trainer/updateTrainerIntroduction`, data);
  }

  deleteTrainerIntroduction(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerIntroduction/${id}`);
  }

  getAllTrainerIntroductions() {
    return this.httpClient.get<ApiResponse<TrainerIntroduction[]>>(`${this.url}/trainer/getAllTrainerIntroductions`);
  }

  getMyTrainerIntroduction() {
    return this.httpClient.get<ApiResponse<TrainerIntroduction>>(`${this.url}/trainer/getMyTrainerIntroduction`);
  }

  // ─────────────────────────────
  // BENEFITS
  // ─────────────────────────────

  addTrainerBenefit(data: any) {
    return this.httpClient.post<ApiResponse<TrainerBenefits>>(`${this.url}/trainer/addTrainerBenefit`, data);
  }

  updateTrainerBenefit(data: any) {
    return this.httpClient.put<ApiResponse<TrainerBenefits>>(`${this.url}/trainer/updateTrainerBenefit`, data);
  }

  deleteTrainerBenefit(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerBenefit/${id}`);
  }

  getAllTrainerBenefits() {
    return this.httpClient.get<ApiResponse<TrainerBenefits[]>>(`${this.url}/trainer/getAllTrainerBenefits`);
  }

  getMyTrainerBenefits() {
    return this.httpClient.get<ApiResponse<TrainerBenefits>>(`${this.url}/trainer/getMyTrainerBenefits`);
  }

  // ─────────────────────────────
  // FEATURE VIDEOS
  // ─────────────────────────────

  addTrainerFeatureVideo(data: any) {
    return this.httpClient.post<ApiResponse<TrainerFeatureVideo>>(`${this.url}/trainer/addTrainerFeatureVideo`, data);
  }

  updateTrainerFeatureVideo(data: any) {
    return this.httpClient.put<ApiResponse<TrainerFeatureVideo>>(`${this.url}/trainer/updateTrainerFeatureVideo`, data);
  }

  deleteTrainerFeatureVideo(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerFeatureVideo/${id}`);
  }

  getAllTrainerFeatureVideos() {
    return this.httpClient.get<ApiResponse<TrainerFeatureVideo[]>>(`${this.url}/trainer/getAllTrainerFeatureVideos`);
  }

  getMyTrainerFeatureVideos() {
    return this.httpClient.get<ApiResponse<TrainerFeatureVideo[]>>(`${this.url}/trainer/getMyTrainerFeatureVideos`);
  }

  getActiveFeatureVideos(trainerId: number) {
    return this.httpClient.get<ApiResponse<TrainerFeatureVideo[]>>(
      `${this.url}/trainer/getActiveFeatureVideos/${trainerId}`);
  }

  updateFeatureVideoPosition(id: number, newPosition: number) {
    return this.httpClient.put<ApiResponse<TrainerFeatureVideo>>(
      `${this.url}/trainer/updateFeatureVideoPosition?id=${id}&newPosition=${newPosition}`, null);
  }

  setFeaturedVideo(id: number) {
    return this.httpClient.put<ApiResponse<TrainerFeatureVideo>>(
      `${this.url}/trainer/setFeaturedVideo/${id}`, null);
  }

  incrementFeatureVideoViews(id: number) {
    return this.httpClient.put<ApiResponse<TrainerFeatureVideo>>(
      `${this.url}/trainer/incrementFeatureVideoViews/${id}`, null);
  }

  // ─────────────────────────────
  // PHOTO ALBUM
  // ─────────────────────────────

  addTrainerPhotosAlbum(data: any) {
    return this.httpClient.post<ApiResponse<TrainerPhotoAlbum>>(`${this.url}/trainer/addTrainerPhotosAlbum`, data);
  }

  updateTrainerPhotosAlbum(data: any) {
    return this.httpClient.put<ApiResponse<TrainerPhotoAlbum>>(`${this.url}/trainer/updateTrainerPhotosAlbum`, data);
  }

  deleteTrainerPhotosAlbum(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerPhotosAlbum/${id}`);
  }

  getAllTrainersPhotosAlbum() {
    return this.httpClient.get<ApiResponse<TrainerPhotoAlbum[]>>(`${this.url}/trainer/getAllTrainersPhotosAlbum`);
  }

  getAllTrainerPhotosAlbumsWithPhotos() {
    return this.httpClient.get<ApiResponse<TrainerPhotoAlbum[]>>(
      `${this.url}/trainer/getAllTrainerPhotosAlbumsWithPhotos`);
  }

  getTrainerPhotosInAlbum(albumId: number) {
    return this.httpClient.get<ApiResponse<TrainerPhotoAlbum>>(
      `${this.url}/trainer/getTrainerPhotosInAlbum/${albumId}`);
  }

  getMyTrainerPhotosAlbum() {
    return this.httpClient.get<ApiResponse<TrainerPhotoAlbum>>(`${this.url}/trainer/getMyTrainerPhotosAlbum`);
  }

  // ─────────────────────────────
  // VIDEO ALBUM
  // ─────────────────────────────

  addTrainerVideosAlbum(data: any) {
    return this.httpClient.post<ApiResponse<TrainerVideoAlbum>>(`${this.url}/trainer/addTrainerVideosAlbum`, data);
  }

  updateTrainerVideosAlbum(data: any) {
    return this.httpClient.put<ApiResponse<TrainerVideoAlbum>>(`${this.url}/trainer/updateTrainerVideosAlbum`, data);
  }

  deleteTrainerVideosAlbum(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerVideosAlbum/${id}`);
  }

  getAllTrainersVideosAlbum() {
    return this.httpClient.get<ApiResponse<TrainerVideoAlbum[]>>(`${this.url}/trainer/getAllTrainersVideosAlbum`);
  }

  getMyTrainerVideosAlbum() {
    return this.httpClient.get<ApiResponse<TrainerVideoAlbum>>(`${this.url}/trainer/getMyTrainerVideosAlbum`);
  }

  // ─────────────────────────────
  // CLIENTS
  // ─────────────────────────────

  getAllTrainerClients() {
    return this.httpClient.get<ApiResponse<TrainerClients[]>>(`${this.url}/trainer/getAllTrainerClients`);
  }
  getMyTrainerClients() {
    return this.httpClient.get<ApiResponse<TrainerClients[]>>(`${this.url}/trainer/getMyTrainerClients`);
  }

  getAllTrainerActiveClients() {
    return this.httpClient.get<ApiResponse<TrainerClients[]>>(`${this.url}/trainer/getAllTrainerActiveClients`);
  }

  getMyTrainerActiveClients() {
    return this.httpClient.get<ApiResponse<TrainerClients[]>>(`${this.url}/trainer/getMyTrainerActiveClients`);
  }

  getMyCenterTrainers() {
    return this.httpClient.get<ApiResponse<CenterTrainers[]>>(`${this.url}/trainer/getMyCenterTrainers`);
  }

  // ─────────────────────────────
  // SUBSCRIPTIONS
  // ─────────────────────────────

  addTrainerSubscription(request: any) {
    return this.httpClient.post<ApiResponse<TrainerSubscription>>(`${this.url}/trainer/addTrainerSubscription`, request);
  }

  updateTrainerSubscription(request: any) {
    return this.httpClient.post<ApiResponse<TrainerSubscription>>(`${this.url}/trainer/updateTrainerSubscription`, request);
  }

  getMyTrainerSubscription() {
    return this.httpClient.get<ApiResponse<TrainerSubscription>>(`${this.url}/trainer/getMyTrainerSubscription`);
  }

  getAllTrainersSubscriptions() {
    return this.httpClient.get<ApiResponse<TrainerSubscription[]>>(`${this.url}/trainer/getAllTrainersSubscriptions`);
  }

  getActiveTrainersSubscriptions() {
    return this.httpClient.get<ApiResponse<TrainerSubscription[]>>(`${this.url}/trainer/getActiveTrainersSubscriptions`);
  }

  updateTrainerSubscriptionStatus(status: string, activationCode: string) {
    return this.httpClient.put<ApiResponse<TrainerSubscription>>(
      `${this.url}/trainer/updateTrainerSubscriptionStatus/${status}/${activationCode}`, null);
  }

  deleteTrainerSubscription(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(
      `${this.url}/trainer/deleteTrainerSubscription/${id}`);
  }

  // ─────────────────────────────
  // REVIEWS
  // ─────────────────────────────

  addTrainerReview(data: any) {
    return this.httpClient.post<ApiResponse<TrainerReview>>(`${this.url}/trainer/addTrainerReview`, data);
  }

  updateTrainerReview(data: any) {
    return this.httpClient.put<ApiResponse<TrainerReview>>(`${this.url}/trainer/updateTrainerReview`, data);
  }

  updateTrainerReviewStatus(id: number) {
    return this.httpClient.put<ApiResponse<TrainerReview>>(`${this.url}/trainer/updateTrainerReviewStatus/${id}`, null);
  }

  disableTrainerReview(id: number) {
    return this.httpClient.put<ApiResponse<TrainerReview>>(`${this.url}/trainer/disableTrainerReview/${id}`, null);
  }

  deleteTrainerReview(id: number) {
    return this.httpClient.delete<ApiResponse<void>>(`${this.url}/trainer/deleteTrainerReview/${id}`);
  }

  getMyTrainerReviews() {
    return this.httpClient.get<ApiResponse<TrainerReview[]>>(`${this.url}/trainer/getMyTrainerReviews`);
  }

  getAllTrainerReviews() {
    return this.httpClient.get<ApiResponse<TrainerReview[]>>(`${this.url}/trainer/getAllTrainerReviews`);
  }

  getActiveTrainerReviews(id: number) {
    return this.httpClient.get<ApiResponse<TrainerReview[]>>(`${this.url}/trainer/getActiveTrainerReviews/${id}`);
  }

  likeTrainerReview(id: number) {
    return this.httpClient.put<ApiResponse<TrainerReview>>(`${this.url}/trainer/likeTrainerReview/${id}`, null);
  }

  getTrainerReviewLikes() {
    return this.httpClient.get<ApiResponse<TrainerReviewLikes[]>>(`${this.url}/trainer/getTrainerReviewLikes`);
  }

  // ─────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────

  getMyTrainerTestimonials() {
    return this.httpClient.get<ApiResponse<TrainerTestimonials[]>>(`${this.url}/trainer/getMyTrainerTestimonials`);
  }

  getAllTrainerTestimonials() {
    return this.httpClient.get<ApiResponse<TrainerTestimonials[]>>(`${this.url}/trainer/getAllTrainerTestimonials`);
  }
}