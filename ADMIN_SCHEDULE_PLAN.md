# Admin Schedule Management System - Implementation Plan

## 📋 Overview

Create a schedule management system for admins to create, edit, and manage studio schedules that clients can then view and book from.

---

## 🏗️ Architecture

### Data Flow

```
ADMIN SIDE (Schedule Creation)
┌─────────────────────────────────┐
│   AdminSchedulesPage.tsx        │
│  - Calendar view (current month)│
│  - Create/Edit form             │
│  - List of existing schedules   │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Backend API                    │
│  POST /admin/schedules          │
│  PUT /admin/schedules/:id       │
│  DELETE /admin/schedules/:id    │
│  GET /admin/schedules           │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  AdminService                   │
│  - createSchedule()             │
│  - updateSchedule()             │
│  - deleteSchedule()             │
│  - getAllSchedules()            │
└──────────┬──────────────────────┘
           │
           ▼
┌─────────────────────────────────┐
│  Database (Schedules Table)     │
│  - schedule_id                  │
│  - session_id (FK)              │
│  - start_time                   │
│  - end_time                     │
│  - capacity_override (optional) │
│  - room                         │
│  - created_at                   │
└─────────────────────────────────┘

CLIENT SIDE (Schedule Viewing & Booking)
┌─────────────────────────────────┐
│   SchedulePage.tsx (Existing)   │
│  - Displays schedules in        │
│    calendar format              │
│  - Click date to expand         │
│  - Shows available sessions     │
│  - Book button on schedule      │
└──────────┬──────────────────────┘
           │ Uses existing
           │ GET /schedule endpoint
           ▼
┌─────────────────────────────────┐
│  Database (Schedules Table)     │
│  Same table as above            │
└─────────────────────────────────┘
```

---

## 📊 Schedule Entity (Already Exists)

```typescript
// src/schedule/entities/schedule.entity.ts
@Entity('schedules')
export class Schedule {
  @PrimaryGeneratedColumn({ type: 'int' })
  schedule_id: number;

  @ManyToOne(() => Session, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'session_id' })
  session: Session;

  @Column({ type: 'timestamp' })
  start_time: Date;

  @Column({ type: 'timestamp' })
  end_time: Date;

  @Column({ type: 'int', nullable: true })
  capacity_override?: number;

  @Column({ type: 'enum', enum: Room, nullable: true })
  room?: Room;

  @ManyToOne(() => User, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'created_by' })
  createdBy?: User;

  @CreateDateColumn({ type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updated_at: Date;
}
```

---

## 🔧 Backend Implementation Steps

### 1. **Create DTOs** (admin.dto.ts)

```typescript
// For creating a schedule
export class CreateScheduleDto {
  @IsNumber()
  session_id: number;

  @IsISO8601()
  start_time: Date;

  @IsISO8601()
  end_time: Date;

  @IsOptional()
  @IsNumber()
  capacity_override?: number;

  @IsOptional()
  @IsString()
  room?: string;
}

// For updating a schedule
export class UpdateScheduleDto {
  @IsOptional()
  @IsNumber()
  session_id?: number;

  @IsOptional()
  @IsISO8601()
  start_time?: Date;

  @IsOptional()
  @IsISO8601()
  end_time?: Date;

  @IsOptional()
  @IsNumber()
  capacity_override?: number;

  @IsOptional()
  @IsString()
  room?: string;
}
```

### 2. **Add Service Methods** (admin.service.ts)

```typescript
// Create a new schedule
async createSchedule(createScheduleDto: CreateScheduleDto) {
  const schedule = this.scheduleRepository.create(createScheduleDto);
  return await this.scheduleRepository.save(schedule);
}

// Update a schedule
async updateSchedule(scheduleId: number, updateScheduleDto: UpdateScheduleDto) {
  const schedule = await this.scheduleRepository.findOne({
    where: { schedule_id: scheduleId }
  });
  if (!schedule) {
    throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
  }

  Object.assign(schedule, updateScheduleDto);
  return await this.scheduleRepository.save(schedule);
}

// Delete a schedule
async deleteSchedule(scheduleId: number) {
  const schedule = await this.scheduleRepository.findOne({
    where: { schedule_id: scheduleId }
  });
  if (!schedule) {
    throw new NotFoundException(`Schedule with ID ${scheduleId} not found`);
  }

  return await this.scheduleRepository.remove(schedule);
}
```

### 3. **Add Controller Endpoints** (admin.controller.ts)

```typescript
@Post('schedules')
async createSchedule(@Body() createScheduleDto: CreateScheduleDto) {
  return this.adminService.createSchedule(createScheduleDto);
}

@Put('schedules/:id')
async updateSchedule(
  @Param('id', ParseIntPipe) scheduleId: number,
  @Body() updateScheduleDto: UpdateScheduleDto,
) {
  return this.adminService.updateSchedule(scheduleId, updateScheduleDto);
}

@Delete('schedules/:id')
async deleteSchedule(@Param('id', ParseIntPipe) scheduleId: number) {
  return this.adminService.deleteSchedule(scheduleId);
}

@Get('schedules')
async getAllSchedules(@Query() query: AdminQueryDto) {
  return this.adminService.getAllSchedules(query);
}
```

---

## 🎨 Frontend Implementation

### AdminSchedulesPage Component Features

#### Layout

```
┌─────────────────────────────────┐
│  Admin Schedules Management     │
├─────────────────────────────────┤
│ [Left Side - Calendar]          │
│  ┌──────────────────────────┐   │
│  │  November 2025           │   │
│  │  < [dates grid] >        │   │
│  │                          │   │
│  │ Selected Date: Nov 15    │   │
│  │ Sessions on this date:   │   │
│  │ - Morning Yoga 8am       │   │
│  │ - Pilates 10am           │   │
│  └──────────────────────────┘   │
│                                 │
│ [Right Side - Create/Edit Form] │
│  ┌──────────────────────────┐   │
│  │ Create New Schedule      │   │
│  │                          │   │
│  │ Session: [Dropdown ▼]    │   │
│  │ Date: [Date Picker]      │   │
│  │ Start Time: [Time]       │   │
│  │ End Time: [Time]         │   │
│  │ Capacity: [Optional]     │   │
│  │ Room: [Optional]         │   │
│  │                          │   │
│  │ [Create] [Cancel]        │   │
│  └──────────────────────────┘   │
│                                 │
│ [Schedule List Below]           │
│  ┌──────────────────────────┐   │
│  │ Existing Schedules       │   │
│  │ - Nov 15, 8:00 AM        │   │
│  │   Morning Yoga           │   │
│  │   [Edit] [Delete]        │   │
│  │                          │   │
│  │ - Nov 15, 10:00 AM       │   │
│  │   Pilates                │   │
│  │   [Edit] [Delete]        │   │
│  └──────────────────────────┘   │
└─────────────────────────────────┘
```

#### Three Sections

1. **Calendar View** (Left)
   - Shows current month
   - Highlight days with schedules
   - Click to select date
   - Show sessions for that date

2. **Create/Edit Form** (Right Top)
   - Session dropdown (select from existing sessions)
   - Date/time pickers
   - Optional fields (capacity, room)
   - Create/Update/Cancel buttons

3. **Schedule List** (Bottom)
   - List of upcoming schedules
   - Edit button (loads into form)
   - Delete button (with confirmation)
   - Sort by date

---

## 🔄 User Workflow

### Admin Creates Schedule

```
1. Admin goes to /admin/schedules
2. Clicks on a date in calendar (or uses date picker)
3. Form auto-fills with selected date
4. Admin selects a session from dropdown
5. Sets start/end times
6. Optionally sets capacity override or room
7. Clicks "Create Schedule"
8. Schedule appears in list and calendar
9. Client immediately sees it when booking
```

### Client Books from Schedule

```
1. Client goes to /schedule
2. Views calendar (same dates as admin created)
3. Clicks on date to expand
4. Sees available sessions
5. Clicks "Book" on a session
6. Completes booking (existing flow)
```

---

## 📝 Implementation Checklist

- [ ] **Backend DTOs** - Add CreateScheduleDto, UpdateScheduleDto
- [ ] **Backend Service** - Add create, update, delete methods
- [ ] **Backend Controller** - Add POST, PUT, DELETE endpoints
- [ ] **Backend Route** - Update admin controller routes
- [ ] **Frontend Page** - Create AdminSchedulesPage.tsx
- [ ] **Frontend API** - Add schedule API methods
- [ ] **Frontend Route** - Add /admin/schedules route
- [ ] **Frontend Navigation** - Add link in Sidebar
- [ ] **Testing** - Test create, update, delete flow
- [ ] **Client Verification** - Confirm client sees new schedules

---

## ✨ Benefits of This Approach

1. **Separation of Concerns** - Admin creates, client views
2. **Reuses Existing Code** - Uses existing Schedule entity and client's SchedulePage
3. **Real-Time Updates** - Clients see schedules immediately
4. **Easy to Manage** - Calendar UI for easy schedule management
5. **Scalable** - Can add filtering, bulk operations later
6. **User-Friendly** - Admin uses calendar, client uses calendar, same mental model

---

## 🚀 Future Enhancements

1. **Bulk Schedule Creation** - "Repeat this schedule for X weeks"
2. **Schedule Templates** - Pre-made weekly schedules
3. **Capacity Auto-Fill** - Auto-set capacity based on session/room
4. **Schedule Analytics** - Show attendance, cancellations per schedule
5. **Trainer Preferences** - Constraints on trainer availability
6. **Conflict Detection** - Prevent overlapping schedules for same trainer
7. **Export/Import** - Bulk schedule operations
8. **Schedule History** - Audit trail of changes

---

## 📞 Questions Answered

**Q: How does admin know which sessions are available?**
A: Dropdown fetches from existing sessions, admin selects one

**Q: What if capacity is different from session default?**
A: `capacity_override` field lets admin set per-schedule capacity

**Q: Can client see behind-the-scenes times?**
A: No, client only sees schedules via existing /schedule endpoint

**Q: What about timezone issues?**
A: Store times in DB as UTC, convert on display based on browser timezone

**Q: Can admin bulk-edit schedules?**
A: Yes, can be added later - mark schedules and apply changes
