import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../enviroments/enviroment';


export interface SkinAnalysisData {

  age: string;

  feel: string;

  problem: string[];

  routine: string[];

  skinType: string;

}


export interface SkinAnalysisRecord {

  id: number;

  age: string;

  feel: string;

  problem: string[];

  routine: string[];

  skin_type: string;

  created_at: string;

}


@Injectable({
  providedIn: 'root'
})
export class SkinAnalysisService {


    private apiUrl = `${environment.apiUrl}/skin-analysis`;
    private adminApiUrl = `${environment.adminApiUrl}/skin-analysis`;

  constructor(
    private http: HttpClient
  ) {}

  saveAnalysis(
    data: SkinAnalysisData
  ): Observable<{ message: string; id: number }> {

    return this.http.post<{
      message: string;
      id: number;
    }>(
      this.apiUrl,
      data
    );

  }

  getMyAnalysis(): Observable<SkinAnalysisRecord[]> {

    return this.http.get<SkinAnalysisRecord[]>(
      this.apiUrl
    );

  }
  getUserAnalysis(
        userId: number
    ): Observable<SkinAnalysisRecord[]> {

        return this.http.get<SkinAnalysisRecord[]>(
            `${this.adminApiUrl}/user/${userId}`
        );

    }
}