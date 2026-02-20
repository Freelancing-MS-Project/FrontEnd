import { Component, OnInit } from '@angular/core';
import { MissionService } from '../../../services/mission.service';
import { Mission } from '../../../models/mission';
import { MissionStatus } from '../../../models/mission-status';
import { Domain } from '../../../models/domain';

@Component({
  selector: 'app-all-missions',
  templateUrl: './all-missions.component.html',
  styleUrls: ['./all-missions.component.css']
})
export class AllMissionsComponent implements OnInit {
  missions: Mission[] = [];
  filteredMissions: Mission[] = [];
  openedSkillPanels = new Set<string>();

  readonly MissionStatus = MissionStatus;
  readonly domains = [
    { label: 'All domains', value: 'ALL' },
    { label: 'Web Development', value: Domain.WebDevelopment },
    { label: 'Mobile Development', value: Domain.MobileDevelopment },
    { label: 'Data Science', value: Domain.DataScience },
    { label: 'Design', value: Domain.Design },
    { label: 'Marketing', value: Domain.Marketing },
    { label: 'DevOps', value: Domain.DevOps },
    { label: 'Cybersecurity', value: Domain.Cybersecurity }
  ];

  readonly statuses = [
    { label: 'All status', value: 'ALL' },
    { label: 'Open', value: MissionStatus.Open },
    { label: 'Archived', value: MissionStatus.Archived },
    { label: 'Closed', value: MissionStatus.Closed }
  ];

  selectedDomain: Domain | 'ALL' = 'ALL';
  selectedStatus: MissionStatus | 'ALL' = 'ALL';

  constructor(private missionService: MissionService) {}

  ngOnInit(): void {
    this.missionService.getAllMissions().subscribe({
      next: (missions) => {
        this.missions = missions;
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error fetching missions:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredMissions = this.missions.filter((mission) => {
      const domainOk = this.selectedDomain === 'ALL' || mission.domain === this.selectedDomain;
      const statusOk = this.selectedStatus === 'ALL' || mission.status === this.selectedStatus;
      return domainOk && statusOk;
    });
  }

  toggleSkillPanel(mission: Mission, index: number): void {
    const key = this.getMissionKey(mission, index);
    if (this.openedSkillPanels.has(key)) {
      this.openedSkillPanels.delete(key);
      return;
    }
    this.openedSkillPanels.add(key);
  }

  isSkillPanelOpen(mission: Mission, index: number): boolean {
    return this.openedSkillPanels.has(this.getMissionKey(mission, index));
  }

  private getMissionKey(mission: Mission, index: number): string {
    return mission.id != null ? `m-${mission.id}` : `idx-${index}`;
  }
}
