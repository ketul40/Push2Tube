/**
 * Script to manually grant a subscription to a user
 * Usage: node scripts/grant-subscription.js <email> <plan>
 * Plans: free, starter, pro, ultra
 * 
 * Example: node scripts/grant-subscription.js ketul40@gmail.com pro
 * 
 * Prerequisites:
 * 1. Install: npm install firebase-admin
 * 2. Get service account key from Firebase Console > Project Settings > Service Accounts
 * 3. Save as serviceAccountKey.json in project root
 */

const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

// Initialize Firebase Admin
let app;
try {
  const serviceAccountPath = path.join(__dirname, '../serviceAccountKey.json');
  
  if (fs.existsSync(serviceAccountPath)) {
    // Use service account key if available
    const serviceAccount = require(serviceAccountPath);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('✅ Using service account key');
  } else {
    // Try using application default credentials (Firebase CLI login)
    app = admin.initializeApp();
    console.log('✅ Using application default credentials (firebase login)');
    console.log('💡 Tip: For production, use serviceAccountKey.json');
  }
} catch (error) {
  console.error('❌ Failed to initialize Firebase Admin:', error.message);
  console.log('\n💡 Solutions:');
  console.log('   1. Download service account key from Firebase Console');
  console.log('   2. Save as serviceAccountKey.json in project root');
  console.log('   3. Or run: firebase login');
  process.exit(1);
}

const db = admin.firestore();

// Subscription plan quotas
const PLAN_QUOTAS = {
  free: 2,
  starter: 20,
  pro: 100,
  ultra: 250
};

// Subscription status
const SUBSCRIPTION_STATUS = {
  free: 'none',
  starter: 'active',
  pro: 'active',
  ultra: 'active'
};

async function grantSubscription(email, planName) {
  try {
    console.log(`\n🔍 Looking up user: ${email}`);
    
    // Find user by email
    const usersRef = db.collection('users');
    const snapshot = await usersRef.where('email', '==', email).limit(1).get();
    
    if (snapshot.empty) {
      console.error(`❌ User with email ${email} not found!`);
      console.log('\n💡 Make sure the user has signed in at least once to create their user document.');
      process.exit(1);
    }
    
    const userDoc = snapshot.docs[0];
    const userId = userDoc.id;
    const userData = userDoc.data();
    
    console.log(`✅ Found user: ${userData.displayName || userData.email}`);
    console.log(`   User ID: ${userId}`);
    console.log(`   Current plan: ${userData.subscriptionPlan || 'free'}`);
    
    // Validate plan name
    if (!PLAN_QUOTAS[planName]) {
      console.error(`❌ Invalid plan: ${planName}`);
      console.log(`   Valid plans: ${Object.keys(PLAN_QUOTAS).join(', ')}`);
      process.exit(1);
    }
    
    // Calculate period dates (30 days from now)
    const now = new Date();
    const periodEnd = new Date(now);
    periodEnd.setDate(periodEnd.getDate() + 30);
    
    // Prepare update data
    const updateData = {
      subscriptionPlan: planName,
      subscriptionStatus: SUBSCRIPTION_STATUS[planName],
      videoQuota: PLAN_QUOTAS[planName],
      videosUsedThisMonth: 0, // Reset usage
    };
    
    // Only add period dates for paid plans
    if (planName !== 'free') {
      updateData.currentPeriodStart = admin.firestore.Timestamp.fromDate(now);
      updateData.currentPeriodEnd = admin.firestore.Timestamp.fromDate(periodEnd);
    } else {
      // Remove period dates for free plan
      updateData.currentPeriodStart = admin.firestore.FieldValue.delete();
      updateData.currentPeriodEnd = admin.firestore.FieldValue.delete();
      updateData.stripeCustomerId = admin.firestore.FieldValue.delete();
      updateData.stripeSubscriptionId = admin.firestore.FieldValue.delete();
    }
    
    // Update user document
    await userDoc.ref.update(updateData);
    
    console.log(`\n✅ Successfully updated subscription!`);
    console.log(`   New plan: ${planName}`);
    console.log(`   Quota: ${PLAN_QUOTAS[planName]} videos/month`);
    console.log(`   Status: ${SUBSCRIPTION_STATUS[planName]}`);
    if (planName !== 'free') {
      console.log(`   Period end: ${periodEnd.toLocaleDateString()}`);
    }
    console.log(`\n🎉 User can now use the ${planName} plan features!\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating subscription:', error);
    process.exit(1);
  }
}

// Get command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log('Usage: node scripts/grant-subscription.js <email> <plan>');
  console.log('\nPlans: free, starter, pro, ultra');
  console.log('\nExample:');
  console.log('  node scripts/grant-subscription.js ketul40@gmail.com pro');
  process.exit(1);
}

const [email, plan] = args;
grantSubscription(email, plan.toLowerCase());

