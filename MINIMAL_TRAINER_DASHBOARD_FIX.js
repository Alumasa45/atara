// Minimal fix for trainer dashboard - replace the getTrainerDashboard method
// in src/dashboards/dashboard.service.ts with this simplified version

async getTrainerDashboard(userId) {
  try {
    console.log('Getting trainer dashboard for user:', userId);
    
    // Get user
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
    });
    if (!user) throw new NotFoundException('User not found');

    // Get trainer profile
    const trainer = await this.trainerRepository.findOne({
      where: { user_id: userId },
      relations: ['user']
    });
    if (!trainer) throw new NotFoundException('Trainer profile not found');

    // Get basic data with simple queries (no complex joins)
    const sessions = await this.sessionRepository.find({
      where: { trainer_id: trainer.trainer_id },
    });

    // Get schedules without complex joins
    const upcomingSchedules = await this.scheduleRepository.find({
      take: 10,
      order: { date: 'ASC' }
    });

    // Return minimal data structure
    return {
      trainer,
      sessions: sessions || [],
      upcomingSchedules: upcomingSchedules || [],
      bookings: [],
      cancellations: [],
      stats: {
        totalSessions: sessions ? sessions.length : 0,
        totalBookings: 0,
        cancelledBookings: 0,
        upcomingCount: upcomingSchedules ? upcomingSchedules.length : 0,
      },
    };
  } catch (error) {
    console.error('Trainer dashboard error:', error);
    throw error;
  }
}