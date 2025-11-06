import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { MembershipsService } from '../memberships/memberships.service';

async function seedMemberships() {
  const app = await NestFactory.create(AppModule);
  const membershipsService = app.get(MembershipsService);

  const plans = [
    {
      name: 'Flow Starter',
      description: 'Perfect for your wellness journey',
      classes_included: 1,
      duration_days: 30,
      price: 1500,
      benefits: [
        '1 class per month',
        'Access to all trainers',
        'Email support',
        'Flexible scheduling',
      ],
      sort_order: 1,
    },
    {
      name: 'Flow Steady',
      description: 'Build momentum with consistent practice',
      classes_included: 4,
      duration_days: 30,
      price: 3500,
      benefits: [
        '4 classes per month',
        'Access to all trainers',
        'Priority booking',
        'Email support',
        'Flexible rescheduling',
      ],
      sort_order: 2,
    },
    {
      name: 'Flow Strong',
      description: 'Transform your wellness with dedicated practice',
      classes_included: 8,
      duration_days: 30,
      price: 6500,
      benefits: [
        '8 classes per month',
        'Access to all trainers',
        'Priority booking',
        '1 free drop-in class',
        'Email & phone support',
        'Custom class recommendations',
      ],
      sort_order: 3,
    },
    {
      name: 'Flow Unlimited Monthly',
      description: 'Unlimited classes - live your best life',
      classes_included: 999,
      duration_days: 30,
      price: 12000,
      benefits: [
        'Unlimited classes',
        'Access to all trainers',
        'Priority booking',
        'Free guest passes (2/month)',
        'VIP email & phone support',
        'Monthly wellness check-in',
        'Exclusive member workshops',
      ],
      sort_order: 4,
    },
    {
      name: 'Flow Quarterly',
      description: 'Committed to 3 months of wellness',
      classes_included: 12,
      duration_days: 90,
      price: 9000,
      benefits: [
        '12 classes per quarter',
        '20% savings vs monthly',
        'Access to all trainers',
        'Priority booking',
        '1 free workshop',
        'Email support',
        'Flexible class rollover',
      ],
      sort_order: 5,
    },
    {
      name: 'Flow Commitment',
      description: 'Six months of transformative wellness',
      classes_included: 30,
      duration_days: 180,
      price: 18000,
      benefits: [
        '30 classes over 6 months',
        '25% savings vs monthly',
        'Access to all trainers',
        'Priority booking',
        '2 free workshops',
        'Dedicated trainer consultation',
        'Free guest pass',
        'Premium phone & email support',
        'Flexible class rollover',
      ],
      sort_order: 6,
    },
  ];

  console.log('🌊 Seeding membership plans...');

  for (const plan of plans) {
    try {
      const created = await membershipsService.createPlan(plan);
      console.log(`✅ Created: ${created.name} - KES ${created.price}`);
    } catch (error) {
      console.error(`❌ Error creating ${plan.name}:`, error.message);
    }
  }

  console.log('🎉 Membership seeding complete!');
  await app.close();
}

seedMemberships().catch(console.error);
