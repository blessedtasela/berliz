import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { EventEmitter } from '@angular/core';
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
  TrainerSubscription,
  TrainerTestimonials,
  TrainerVideoAlbum
} from '../models/trainers.interface';

import { TrainerLikes } from '../models/trainers.interface';
import { CenterTrainers } from '../models/centers.interface';

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
    return this.httpClient.post<Trainers>(`${this.url}/trainer/add`, data);
  }

  getAllTrainers() {
    return this.httpClient.get<Trainers[]>(`${this.url}/trainer/get`);
  }

  getActiveTrainers() {
    return this.httpClient.get<Trainers[]>(`${this.url}/trainer/getActiveTrainers`);
  }

  updateTrainer(data: any) {
    return this.httpClient.put<Trainers>(`${this.url}/trainer/update`, data);
  }

  updateTrainerPhoto(data: any) {
    return this.httpClient.put<Trainers>(`${this.url}/trainer/updateTrainerPhoto`, data);
  }

  deleteTrainer(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/delete/${id}`);
  }

  updateStatus(id: number) {
    return this.httpClient.put<void>(
      `${this.url}/trainer/updateStatus/${id}`,
      null,
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }

  getTrainer() {
    return this.httpClient.get<Trainers>(`${this.url}/trainer/getTrainer`);
  }

  likeTrainer(id: number) {
    return this.httpClient.put<void>(
      `${this.url}/trainer/like/${id}`,
      null,
      { headers: new HttpHeaders().set('Content-Type', 'application/json') }
    );
  }

  getMyTrainerLikes() {
    return this.httpClient.get<TrainerLikes[]>(`${this.url}/trainer/getMyTrainerLikes`);
  }

  getAllTrainerLikes() {
    return this.httpClient.get<TrainerLikes[]>(`${this.url}/trainer/getAllTrainerLikes`);
  }

  // ─────────────────────────────
  // PRICING
  // ─────────────────────────────

  addTrainerPricing(data: any) {
    return this.httpClient.post<TrainerPricing>(`${this.url}/trainer/addTrainerPricing`, data);
  }

  updateTrainerPricing(data: any) {
    return this.httpClient.put<TrainerPricing>(`${this.url}/trainer/updateTrainerPricing`, data);
  }

  getAllTrainerPricing() {
    return this.httpClient.get<TrainerPricing[]>(`${this.url}/trainer/getAllTrainerPricing`);
  }

  getMyTrainerPricing() {
    return this.httpClient.get<TrainerPricing>(`${this.url}/trainer/getMyTrainerPricing`);
  }

  deleteTrainerPricing(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerPricing/${id}`);
  }

  // ─────────────────────────────
  // INTRODUCTION
  // ─────────────────────────────

  addTrainerIntroduction(data: any) {
    return this.httpClient.post<TrainerIntroduction>(`${this.url}/trainer/addTrainerIntroduction`, data);
  }

  updateTrainerIntroduction(data: any) {
    return this.httpClient.put<TrainerIntroduction>(`${this.url}/trainer/updateTrainerIntroduction`, data);
  }

  deleteTrainerIntroduction(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerIntroduction/${id}`);
  }

  getAllTrainerIntroductions() {
    return this.httpClient.get<TrainerIntroduction>(`${this.url}/trainer/getAllTrainerIntroductions`);
  }

  getMyTrainerIntroduction() {
    return this.httpClient.get<TrainerIntroduction>(`${this.url}/trainer/getMyTrainerIntroduction`);
  }

  // ─────────────────────────────
  // BENEFITS
  // ─────────────────────────────

  addTrainerBenefit(data: any) {
    return this.httpClient.put<TrainerBenefits>(`${this.url}/trainer/addTrainerBenefit`, data);
  }

  updateTrainerBenefit(data: any) {
    return this.httpClient.put<TrainerBenefits>(`${this.url}/trainer/updateTrainerBenefit`, data);
  }

  deleteTrainerBenefit(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerBenefit/${id}`);
  }

  getAllTrainerBenefits() {
    return this.httpClient.get<TrainerBenefits[]>(`${this.url}/trainer/getAllTrainerBenefits`);
  }

  getMyTrainerBenefits() {
    return this.httpClient.get<TrainerBenefits>(`${this.url}/trainer/getMyTrainerBenefits`);
  }

  // ─────────────────────────────
  // FEATURE VIDEOS
  // ─────────────────────────────

  addTrainerFeatureVideo(data: any) {
    return this.httpClient.post<TrainerFeatureVideo>(`${this.url}/trainer/addTrainerFeatureVideo`, data);
  }

  updateTrainerFeatureVideo(data: any) {
    return this.httpClient.put<TrainerFeatureVideo>(`${this.url}/trainer/updateTrainerFeatureVideo`, data);
  }

  deleteTrainerFeatureVideo(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerFeatureVideo/${id}`);
  }

  getAllTrainerFeatureVideos() {
    return this.httpClient.get<TrainerFeatureVideo[]>(`${this.url}/trainer/getAllTrainerFeatureVideos`);
  }

  getMyTrainerFeatureVideos() {
    return this.httpClient.get<TrainerFeatureVideo[]>(`${this.url}/trainer/getMyTrainerFeatureVideos`);
  }

  // ─────────────────────────────
  // PHOTO ALBUM
  // ─────────────────────────────

  addTrainerPhotoAlbum(data: any) {
    return this.httpClient.post<TrainerPhotoAlbum>(`${this.url}/trainer/addTrainerPhotosAlbum`, data);
  }

  updateTrainerPhotoAlbum(data: any) {
    return this.httpClient.put<TrainerPhotoAlbum>(`${this.url}/trainer/updateTrainerPhotosAlbum`, data);
  }

  deleteTrainerPhotoAlbum(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerPhotosAlbum/${id}`);
  }

  getAllTrainerPhotoAlbums() {
    return this.httpClient.get<TrainerPhotoAlbum[]>(`${this.url}/trainer/getAllTrainerPhotosAlbums`);
  }

  getMyTrainerPhotosAlbum() {
    return this.httpClient.get<TrainerPhotoAlbum>(`${this.url}/trainer/getMyTrainerPhotosAlbum`);
  }

  // ─────────────────────────────
  // VIDEO ALBUM
  // ─────────────────────────────

  addTrainerVideoAlbum(data: any) {
    return this.httpClient.post<TrainerVideoAlbum>(`${this.url}/trainer/addTrainerVideoAlbum`, data);
  }

  updateTrainerVideoAlbum(data: any) {
    return this.httpClient.put<TrainerVideoAlbum>(`${this.url}/trainer/updateTrainerVideoAlbum`, data);
  }

  deleteTrainerVideoAlbum(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerVideoAlbum/${id}`);
  }

  getAllTrainerVideosAlbum() {
    return this.httpClient.get<TrainerVideoAlbum[]>(`${this.url}/trainer/getAllTrainerVideosAlbum`);
  }

  getMyTrainerVideosAlbum() {
    return this.httpClient.get<TrainerVideoAlbum>(`${this.url}/trainer/getMyTrainerVideosAlbum`);
  }

  // ─────────────────────────────
  // CLIENTS
  // ─────────────────────────────

  getMyTrainerClients() {
    return this.httpClient.get<TrainerClients[]>(`${this.url}/trainer/getMyTrainerClients`);
  }

  getMyActiveClients() {
    return this.httpClient.get<TrainerClients[]>(`${this.url}/trainer/getMyActiveClients`);
  }

  // ─────────────────────────────
  // SUBSCRIPTIONS
  // ─────────────────────────────

  getMyTrainerSubscriptions() {
    return this.httpClient.get<TrainerSubscription[]>(`${this.url}/trainer/getMyTrainerSubscriptions`);
  }

  getAllTrainerSubscriptions() {
    return this.httpClient.get<TrainerSubscription[]>(`${this.url}/trainer/getAllTrainerSubscriptions`);
  }

  // ─────────────────────────────
  // REVIEWS
  // ─────────────────────────────

  addTrainerReview(data: any) {
    return this.httpClient.post<TrainerReview>(`${this.url}/trainer/addTrainerReview`, data);
  }

  updateTrainerReview(data: any) {
    return this.httpClient.put<TrainerReview>(`${this.url}/trainer/updateTrainerReview`, data);
  }

  updateTrainerReviewStatus(id: number) {
    return this.httpClient.put<void>(`${this.url}/trainer/updateTrainerReviewStatus/${id}`, null);
  }

  disableTrainerReview(id: number) {
    return this.httpClient.put<void>(`${this.url}/trainer/disableTrainerReview/${id}`, null);
  }

  deleteTrainerReview(id: number) {
    return this.httpClient.delete<void>(`${this.url}/trainer/deleteTrainerReview/${id}`);
  }

  getMyTrainerReviews() {
    return this.httpClient.get<TrainerReview[]>(`${this.url}/trainer/getMyTrainerReviews`);
  }

  getAllTrainerReviews() {
    return this.httpClient.get<TrainerReview[]>(`${this.url}/trainer/getAllTrainerReviews`);
  }

  getActiveTrainerReviews() {
    return this.httpClient.get<TrainerReview[]>(`${this.url}/trainer/getActiveTrainerReviews`);
  }

  // ─────────────────────────────
  // TESTIMONIALS
  // ─────────────────────────────

  getMyTrainerTestimonials() {
    return this.httpClient.get<TrainerTestimonials[]>(`${this.url}/trainer/getMyTrainerTestimonials`);
  }

  // ─────────────────────────────
  // CENTER TRAINERS
  // ─────────────────────────────

  getMyCenterTrainers() {
    return this.httpClient.get<CenterTrainers[]>(`${this.url}/trainer/getMyCenterTrainers`);
  }
}