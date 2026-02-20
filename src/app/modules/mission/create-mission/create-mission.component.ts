import { Component, OnInit } from '@angular/core';
import { Mission } from '../../../models/mission';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MissionService } from '../../../services/mission.service';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MissionStatus } from '../../../models/mission-status';
@Component({
  selector: 'app-create-mission',
  templateUrl: './create-mission.component.html',
  styleUrl: './create-mission.component.css'
})
export class CreateMissionComponent implements OnInit {

 //controle de saisie
  missionForm!:FormGroup;
  mission!:Mission;
  message: string = '';
  error: string = '';
today!: string;

constructor(private missionService: MissionService,private fb:FormBuilder,private router:Router) {
  }
futureDateValidator(control: any) {
  if (!control.value) return null;

  const selectedDate = new Date(control.value);
  const today = new Date();

  // Supprimer l'heure pour comparaison propre
  today.setHours(0,0,0,0);

  if (selectedDate < today) {
    return { pastDate: true };
  }

  return null;
}

ngOnInit(): void {
  const today = new Date();
  this.today = today.toISOString().split('T')[0];
this.missionForm=this.fb.group({
    title:['',[Validators.required,Validators.minLength(10)]],
    description:['',[Validators.required,Validators.minLength(20)]],
    budget:['',[Validators.required,Validators.min(100)]],

    domain:['',[Validators.required]],
durationInWeeks:['',[Validators.required,Validators.min(1),Validators.max(52)]],
finishedAt:['',[Validators.required,this.futureDateValidator.bind(this)]],

});
}

onSubmit(){
 if(this.missionForm.valid){
//récupérerl'id du client connecté
const clientId = 1;
if(!clientId){
            this.error = 'Client ID not found in local storage';
            console.error(this.error);
            return;
        }
this.mission=this.missionForm.value;
this.mission.clientId=clientId;
this.mission.createdAt=new Date();
this.mission.updatedAt=new Date();
//mettrestatus à "open" par défaut
this.mission.status=MissionStatus.Open;
this.missionService.createMission(this.mission).subscribe({
next:()=>{
this.error='';
this.message='Mission created successfully!';
console.log(this.message);
this.missionForm.reset();
Swal.fire({
title: 'Success!',
text: 'Mission created successfully!',
icon: 'success',
confirmButtonText: 'OK'
});
setTimeout(() => {
  this.router.navigate(['/missions']);
},3000);
},
error:(err)=>{
this.error='Failed to create mission. Please try again.';
console.error('Error creating mission:', err);
Swal.fire({
title: 'Error!',
text: 'Failed to create mission. Please try again.',
icon: 'error',
confirmButtonText: 'OK'
});
}



  });




 }

}
}
