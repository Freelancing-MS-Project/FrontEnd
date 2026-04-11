import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Mission } from '../models/mission';

@Injectable({
  providedIn: 'root'
})
export class MissionService {

  constructor(private http:HttpClient) { }
private baseUrl = 'http://localhost:8099/freelancerProject/mission';

// Method to create a new mission
createMission(mission: Mission) {
return this.http.post<Mission>(`${this.baseUrl}/addMission`, mission);

}

//Method to update an existing mission
updateMission(id: number, mission: Mission) {
return this.http.put<Mission>(`${this.baseUrl}/updateMission/${id}`, mission);
}


// Method to delete a mission
deleteMission(id: number) {
return this.http.delete(`${this.baseUrl}/deleteMission/${id}`);
}

// Method to get a mission by ID
getMissionById(id: number) {
return this.http.get<Mission>(`${this.baseUrl}/getMissionById/${id}`);
}

// Method to get missions by client ID
getMissionsByClientId(clientId: number) {
return this.http.get<Mission[]>(`${this.baseUrl}/getMissionsByClientId/${clientId}`);
}

// Method to get all missions
getAllMissions() {
return this.http.get<Mission[]>(`${this.baseUrl}/getAllMissions`);
}










}
