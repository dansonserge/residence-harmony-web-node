# Résidence Harmonie — API Documentation

This document outlines the API endpoints utilized by the Résidence Harmonie WebApp for its Server-Side Rendering (SSR) and interactive features. All endpoints are currently served by the Mock Server running on `localhost:3001`.

---

## 1. Manager Dashboard
**Route:** `/manager`  
**Internal Call:** `GET /residences/residence-1/manager/dashboard`

### Response Schema (JSON)
```json
{
  "id": "md-1",
  "residenceId": "residence-1",
  "kpis": {
    "activeResidents": 24,
    "tasksCompleted": 156,
    "completionRate": 92,
    "pendingTasks": 12,
    "refusedTasks": 3,
    "observationsToday": 8
  },
  "charts": {
    "tasksByPeriod": [
      { "period": "Morning", "rate": 85 },
      { "period": "Lunch", "rate": 78 }
    ],
    "tasksByResident": [
      { "name": "Jean Dupuis", "completed": 6, "total": 6 }
    ]
  },
  "tables": {
    "pendingTasks": [
      { "resident": "Monique R.", "task": "Douche", "dueTime": "10:00 AM" }
    ],
    "recentObservations": [
      { "resident": "Jean D.", "text": "Refus de la douche", "status": "critical" }
    ]
  }
}
```

---

## 2. Employee Portal
**Route:** `/employee`

### A. Fetch Resident List
**Internal Call:** `GET /residences/residence-1/residents`

#### Response Schema (JSON)
```json
[
  {
    "id": "res-1",
    "name": "Jean Dupuis",
    "roomNumber": "201",
    "photoUrl": "https://i.pravatar.cc/150?u=jean",
    "doneTasksCount": 3,
    "totalTasksCount": 6,
    "alerts": {
      "texture": "Regular",
      "risk": "Fall"
    }
  }
]
```

### B. Fetch Resident Tasks
**Internal Call:** `GET /residences/residence-1/residents/:id/tasks`  
**Query Parameters:** `period` (Filtered server-side in `server.js`)

#### Response Schema (JSON)
```json
[
  {
    "id": "t1",
    "name": "Lever",
    "description": "Réveil à 7h30",
    "duration": "20 min",
    "priority": "Haute",
    "status": "Done",
    "period": "Morning",
    "observation": "Le réveil s'est bien passé."
  }
]
```

### C. Update Task Status/Observation
**Client-Side Call:** `PATCH /tasks/:taskId`  

#### Request Payload (JSON)
```json
{
  "status": "Done",
  "observation": "Patient felt much better after the walk."
}
```

---

## 3. Admin Dashboard
**Route:** `/admin`  
**Internal Call:** `GET /residences/residence-1/admin/dashboard`

### Response Schema (JSON)
```json
{
  "id": "ad-1",
  "generalSettings": {
    "residenceName": "Résidence Harmonie",
    "address": "123 Rue des Pins, Montréal, QC",
    "language": "Français"
  },
  "periodsCount": 6,
  "shiftsCount": 3,
  "catalogItems": [
    { "name": "Douche", "category": "Hygiène", "duration": "30 min", "priority": "Haute" }
  ],
  "users": [
    { "name": "Marie Martin", "role": "Employee", "status": "Active" }
  ]
}
```
