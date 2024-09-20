import { HttpClient, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TrainerService {
  url = environment.apiUrl;
  trainerEventEmitter = new EventEmitter();


  constructor(private httpClient: HttpClient) { }
  
    addTrainer(data: any) {
      return this.httpClient.post(this.url + "/trainer/add", data);
    }
  
    getAllTrainers() {
      return this.httpClient.get(this.url + "/trainer/get");
    }
  
    getActiveTrainers() {
      return this.httpClient.get(this.url + "/trainer/getActiveTrainers");
    }
  
    updateTrainer(data: any) {
      return this.httpClient.put(this.url + "/trainer/update", data);
    }
  
    updatePhoto(data: any) {
      return this.httpClient.put(this.url + "/trainer/updatePhoto", data);
    }
  
    deleteTrainer(id: number) {
      return this.httpClient.delete(this.url + `/trainer/delete/${id}`);
    }
  
    updateStatus(id: number) {
      return this.httpClient.put(this.url + `/trainer/updateStatus/${id}`, null, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      });
    }
  
    getTrainer() {
      return this.httpClient.get(this.url + "/trainer/getTrainer");
    }
  
    likeTrainer(id: number) {
      return this.httpClient.put(this.url + `/trainer/like/${id}`, null, {
        headers: new HttpHeaders().set('Content-Type', 'application/json')
      });
    }
  
    getTrainerLikes() {
      return this.httpClient.get(this.url + "/trainer/getTrainerLikes");
    }
  
    addTrainerPricing(data: any) {
      return this.httpClient.post(this.url + "/trainer/addTrainerPricing", data);
    }
  
    updateTrainerPricing(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerPricing", data);
    }
  
    getAllTrainerPricing() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerPricing");
    }
  
    getMyTrainerPricing() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerPricing");
    }
  
    deleteTrainerPricing(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerPricing/${id}`);
    }
  
    addTrainerPhotoAlbum(data: any) {
      return this.httpClient.put(this.url + "/trainer/addTrainerPhotoAlbum", data);
    }
  
    updateTrainerPhotoAlbum(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerPhotoAlbum", data);
    }
  
    deleteTrainerPhotoAlbum(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerPhotoAlbum/${id}`);
    }
  
    getAllTrainerPhotoAlbums() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerPhotoAlbums");
    }
  
    getMyTrainerPhotoAlbums() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerPhotoAlbums");
    }
  
    addTrainerBenefit(data: any) {
      return this.httpClient.put(this.url + "/trainer/addTrainerBenefit", data);
    }
  
    updateTrainerBenefit(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerBenefit", data);
    }
  
    deleteTrainerBenefit(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerBenefit/${id}`);
    }
  
    getAllTrainerBenefits() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerBenefits");
    }
  
    getMyTrainerBenefits() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerBenefit");
    }
  
    addTrainerIntroduction(data: any) {
      return this.httpClient.post(this.url + "/trainer/addTrainerIntroduction", data);
    }
  
    updateTrainerIntroduction(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerIntroduction", data);
    }
  
    deleteTrainerIntroduction(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerIntroduction/${id}`);
    }
  
    getAllTrainerIntroductions() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerIntroductions");
    }
  
    getMyTrainerIntroduction() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerIntroduction");
    }
  
    addTrainerVideoAlbum(data: any) {
      return this.httpClient.post(this.url + "/trainer/addTrainerVideoAlbum", data);
    }
  
    updateTrainerVideoAlbum(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerVideoAlbum", data);
    }
  
    deleteTrainerVideoAlbum(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerVideoAlbum/${id}`);
    }
  
    getAllTrainerVideoAlbums() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerVideoAlbums");
    }
  
    getMyTrainerVideoAlbums() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerVideoAlbums");
    }
  
    getMyClients() {
      return this.httpClient.get(this.url + "/trainer/getMyClients");
    }
  
    getMyActiveClients() {
  
  
      return this.httpClient.get(this.url + "/trainer/getMyActiveClients");
    }
  
    addTrainerFeatureVideo(data: any) {
      return this.httpClient.post(this.url + "/trainer/addTrainerFeatureVideo", data);
    }
  
    updateTrainerFeatureVideo(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerFeatureVideo", data);
    }
  
    deleteTrainerFeatureVideo(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerFeatureVideo/${id}`);
    }
  
    getAllTrainerFeatureVideos() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerFeatureVideos");
    }
  
    getMyTrainerFeatureVideo() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerFeatureVideo");
    }
  
    likeTrainerReview(id: number) {
      return this.httpClient.delete(this.url + `/trainer/likeTrainerReview/${id}`);
    }
  
    getTrainerReviewLikes() {
      return this.httpClient.get(this.url + "/trainer/getTrainerReviewLikes");
    }
  
    getMyCenterTrainers() {
      return this.httpClient.get(this.url + "/trainer/getMyCenterTrainers");
    }
  
    addTrainerReview(data: any) {
      return this.httpClient.post(this.url + "/trainer/addTrainerReview", data);
    }
  
    updateTrainerReview(data: any) {
      return this.httpClient.put(this.url + "/trainer/updateTrainerReview", data);
    }
  
    updateTrainerReviewStatus(id: number) {
      return this.httpClient.put(this.url + `/trainer/updateTrainerReviewStatus/${id}`, null);
    }
  
    disableTrainerReview(id: number) {
      return this.httpClient.put(this.url + `/trainer/disableTrainerReview/${id}`, null);
    }
  
    deleteTrainerReview(id: number) {
      return this.httpClient.delete(this.url + `/trainer/deleteTrainerReview/${id}`);
    }
  
    getMyTrainerReviews() {
      return this.httpClient.get(this.url + "/trainer/getMyTrainerReviews");
    }
  
    getAllTrainerReviews() {
      return this.httpClient.get(this.url + "/trainer/getAllTrainerReviews");
    }
  
    getActiveTrainerReviews(id: number) {
      return this.httpClient.get(this.url + `/trainer/getActiveTrainerReviews/${id}`);
    }

}
