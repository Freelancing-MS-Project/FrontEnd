import { Domain } from "./domain";
import { MissionStatus } from "./mission-status";

export interface Mission {
id?: number;
title: string;
description: string;
domain:Domain;
status:MissionStatus;
durationInWeeks: number;
budget: number;
createdAt: Date;
updatedAt: Date;
finishedAt: Date;
extractedSkills: string[];
clientId: number;

}
