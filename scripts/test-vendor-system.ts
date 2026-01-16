/* eslint-disable @typescript-eslint/no-explicit-any */
// scripts/test-vendor-system.ts
// Run with: npx tsx scripts/test-vendor-system.ts

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";


async function testVendorSystem() {
  console.log("🧪 Testing Vendor System...\n");

  try {
    // 1. Create a test landlord
    console.log("1️⃣ Creating test landlord...");
    const landlordPassword = await bcrypt.hash("TestPass123!", 10);
    
    const landlordUser = await prisma.user.upsert({
      where: { email: "test-landlord@example.com" },
      update: {},
      create: {
        email: "test-landlord@example.com",
        name: "Test Landlord",
        phone: "555-0001",
        password: landlordPassword,
        role: "LANDLORD",
        status: "ACTIVE",
        emailVerified: new Date(),
      },
    });

    const landlord = await prisma.landlord.upsert({
      where: { userId: landlordUser.id },
      update: {},
      create: {
        userId: landlordUser.id,
        businessName: "Test Property Management",
        subscriptionTier: "PROFESSIONAL",
        subscriptionStatus: "ACTIVE",
        propertyLimit: 10,
      },
    });

    console.log("✅ Landlord created:", landlordUser.email);

    // 2. Create test vendors
    console.log("\n2️⃣ Creating test vendors...");
    
    const vendorCategories = [
      { category: "PLUMBER", name: "ABC Plumbing", services: ["Leak Repair", "Pipe Installation"] },
      { category: "ELECTRICIAN", name: "Bright Electric", services: ["Wiring", "Panel Upgrades"] },
      { category: "HVAC", name: "Cool Air Systems", services: ["AC Repair", "Heating"] },
    ];

    const vendors = [];
    for (const vData of vendorCategories) {
      const vendorPassword = await bcrypt.hash("VendorPass123!", 10);
      const email = `${vData.name.toLowerCase().replace(/\s+/g, "-")}@example.com`;
      
      const vendorUser = await prisma.user.upsert({
        where: { email },
        update: {},
        create: {
          email,
          name: `${vData.name} Owner`,
          phone: "555-" + Math.random().toString().slice(2, 6),
          password: vendorPassword,
          role: "VENDOR",
          status: "ACTIVE",
          emailVerified: new Date(),
        },
      });

      const vendor = await prisma.vendor.upsert({
        where: { userId: vendorUser.id },
        update: {},
        create: {
          userId: vendorUser.id,
          businessName: vData.name,
          category: vData.category as any,
          services: vData.services,
          isActive: true,
        },
      });

      vendors.push(vendor);
      console.log(`✅ Vendor created: ${vendor.businessName} (${vendor.category})`);
    }

    // 3. Create a test property
    console.log("\n3️⃣ Creating test property...");
    
    const property = await prisma.property.create({
      data: {
        landlordId: landlord.id,
        name: "Test Apartment Complex",
        type: "MULTI_FAMILY",
        address: "123 Test Street",
        city: "Test City",
        state: "CA",
        zipCode: "90210",
      },
    });

    console.log("✅ Property created:", property.name);

    // 4. Create maintenance tickets
    console.log("\n4️⃣ Creating maintenance tickets...");
    
    const ticketData = [
      { title: "Leaking Faucet", category: "Plumbing", priority: "MEDIUM" },
      { title: "Broken Light Fixture", category: "Electrical", priority: "HIGH" },
      { title: "AC Not Cooling", category: "HVAC", priority: "URGENT" },
    ];

    for (const tData of ticketData) {
      const ticket = await prisma.maintenanceTicket.create({
        data: {
          propertyId: property.id,
          createdById: landlordUser.id,
          title: tData.title,
          description: `Test ${tData.title.toLowerCase()} that needs fixing`,
          category: tData.category,
          priority: tData.priority as any,
          status: "OPEN",
        },
      });

      console.log(`✅ Ticket created: ${ticket.title}`);
    }

    // 5. Assign vendors to tickets
    console.log("\n5️⃣ Assigning vendors to tickets...");
    
    const tickets = await prisma.maintenanceTicket.findMany({
      where: { propertyId: property.id },
    });

    for (let i = 0; i < tickets.length && i < vendors.length; i++) {
      await prisma.maintenanceTicket.update({
        where: { id: tickets[i].id },
        data: {
          vendorId: vendors[i].id,
          assignedToId: vendors[i].userId,
          status: "IN_PROGRESS",
        },
      });

      console.log(`✅ Assigned ${vendors[i].businessName} to "${tickets[i].title}"`);
    }

    // 6. Add vendor reviews
    console.log("\n6️⃣ Adding vendor reviews...");
    
    for (const vendor of vendors.slice(0, 2)) {
      await prisma.vendorReview.create({
        data: {
          vendorId: vendor.id,
          authorId: landlordUser.id,
          rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
          title: "Great service!",
          comment: "Very professional and completed the work on time.",
          qualityRating: 5,
          punctualityRating: 5,
          professionalismRating: 5,
        },
      });

      // Update vendor rating
      const reviews = await prisma.vendorReview.findMany({
        where: { vendorId: vendor.id },
      });
      const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
      
      await prisma.vendor.update({
        where: { id: vendor.id },
        data: {
          rating: avgRating,
          reviewCount: reviews.length,
        },
      });

      console.log(`✅ Added review for ${vendor.businessName}`);
    }

    // 7. Test statistics
    console.log("\n7️⃣ Testing statistics...");
    
    for (const vendor of vendors) {
      const stats = {
        totalJobs: await prisma.maintenanceTicket.count({
          where: { vendorId: vendor.id },
        }),
        completedJobs: await prisma.maintenanceTicket.count({
          where: { vendorId: vendor.id, status: "COMPLETED" },
        }),
        activeJobs: await prisma.maintenanceTicket.count({
          where: {
            vendorId: vendor.id,
            status: { in: ["OPEN", "IN_PROGRESS", "SCHEDULED"] },
          },
        }),
      };

      console.log(`📊 ${vendor.businessName}:`);
      console.log(`   Total: ${stats.totalJobs}, Active: ${stats.activeJobs}`);
    }

    // 8. Summary
    console.log("\n✅ TEST COMPLETE!\n");
    console.log("📝 Test Accounts Created:");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`Landlord: test-landlord@example.com (password: TestPass123!)`);
    console.log(`Property: ${property.name}`);
    console.log(`\nVendors:`);
    for (const vendor of vendors) {
      const user = await prisma.user.findUnique({ where: { id: vendor.userId } });
      console.log(`  - ${vendor.businessName}: ${user?.email} (password: VendorPass123!)`);
    }
    console.log(`\nTickets: ${tickets.length} created and assigned`);
    console.log(`\n🌐 Test URLs:`);
    console.log(`  Landlord Dashboard: http://localhost:3000/dashboard`);
    console.log(`  Vendors Page: http://localhost:3000/dashboard/vendors`);
    console.log(`  Vendor Dashboard: http://localhost:3000/dashboard/tickets`);
    console.log(`\n💡 You can now test the vendor system!`);

  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Cleanup function
async function cleanupTestData() {
  console.log("🧹 Cleaning up test data...\n");

  try {
    // Delete in reverse order of creation
    await prisma.vendorReview.deleteMany({
      where: {
        author: {
          email: "test-landlord@example.com",
        },
      },
    });

    await prisma.maintenanceTicket.deleteMany({
      where: {
        property: {
          landlord: {
            user: {
              email: "test-landlord@example.com",
            },
          },
        },
      },
    });

    await prisma.property.deleteMany({
      where: {
        landlord: {
          user: {
            email: "test-landlord@example.com",
          },
        },
      },
    });

    await prisma.vendor.deleteMany({
      where: {
        user: {
          email: {
            contains: "@example.com",
          },
        },
      },
    });

    await prisma.landlord.deleteMany({
      where: {
        user: {
          email: "test-landlord@example.com",
        },
      },
    });

    await prisma.user.deleteMany({
      where: {
        email: {
          contains: "@example.com",
        },
      },
    });

    console.log("✅ Cleanup complete!");
  } catch (error) {
    console.error("❌ Cleanup error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main execution
const args = process.argv.slice(2);
if (args.includes("--cleanup")) {
  cleanupTestData();
} else {
  testVendorSystem();
}

export { testVendorSystem, cleanupTestData };