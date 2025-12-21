import { UserRole } from "@prisma/client";
import { prisma } from "../../shared/prisma";

// Get Dashboard Statistics based on user role
const getDashboardStats = async (userEmail: string, userRole: UserRole) => {
  // Get user info
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
    select: { id: true, role: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  // Route to appropriate stats function based on role
  switch (userRole) {
    case UserRole.ADMIN:
      return await getAdminDashboardStats();
    case UserRole.HOST:
      return await getHostDashboardStats(user.id);
    case UserRole.USER:
      return await getUserDashboardStats(user.id);
    default:
      throw new Error("Invalid user role");
  }
};

// =====================================================
// ADMIN DASHBOARD STATISTICS
// =====================================================
const getAdminDashboardStats = async () => {
  // Parallel queries for better performance
  const [
    totalUsers,
    totalHosts,
    totalEvents,
    totalBookings,
    totalRevenue,
    activeEvents,
    completedEvents,
    pendingVerifications,
    recentUsers,
    recentHosts,
    recentEvents,
    recentBookings,
    topRatedHosts,
    popularEvents,
    monthlyStats,
  ] = await Promise.all([
    // Total Users
    prisma.user.count({
      where: { role: UserRole.USER, status: "ACTIVE" },
    }),

    // Total Hosts
    prisma.host.count({
      where: { status: "ACTIVE", isDeleted: false },
    }),

    // Total Events
    prisma.event.count(),

    // Total Bookings
    prisma.eventParticipant.count(),

    // Total Revenue
    prisma.payment.aggregate({
      where: { status: "COMPLETED" },
      _sum: { amount: true },
    }),

    // Active Events
    prisma.event.count({
      where: { status: "OPEN" },
    }),

    // Completed Events
    prisma.event.count({
      where: { status: "COMPLETED" },
    }),

    // Pending Host Verifications
    prisma.host.count({
      where: {
        verificationStatus: "PENDING",
        isDeleted: false,
      },
    }),

    // Recent Users (Last 30 days)
    prisma.user.count({
      where: {
        role: UserRole.USER,
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Recent Hosts (Last 30 days)
    prisma.host.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Recent Events (Last 30 days)
    prisma.event.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Recent Bookings (Last 30 days)
    prisma.eventParticipant.count({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        },
      },
    }),

    // Top Rated Hosts
    prisma.host.findMany({
      where: {
        status: "ACTIVE",
        isDeleted: false,
        rating: { gt: 0 },
      },
      select: {
        id: true,
        name: true,
        email: true,
        profilePhoto: true,
        rating: true,
        reviewCount: true,
        totalEventsHosted: true,
        totalEarnings: true,
      },
      orderBy: { rating: "desc" },
      take: 5,
    }),

    // Popular Events (Most bookings)
    prisma.event.findMany({
      where: {
        status: { in: ["OPEN", "COMPLETED"] },
      },
      select: {
        id: true,
        name: true,
        type: true,
        date: true,
        city: true,
        country: true,
        joiningFee: true,
        status: true,
        _count: {
          select: {
            eventParticipants: true,
            reviews: true,
          },
        },
        host: {
          select: {
            name: true,
            profilePhoto: true,
          },
        },
      },
      orderBy: {
        eventParticipants: {
          _count: "desc",
        },
      },
      take: 5,
    }),

    // Monthly Statistics (Last 6 months)
    getMonthlyStatistics(),
  ]);

  // Calculate growth rates
  const userGrowthRate = await calculateGrowthRate("user");
  const hostGrowthRate = await calculateGrowthRate("host");
  const eventGrowthRate = await calculateGrowthRate("event");
  const revenueGrowthRate = await calculateRevenueGrowthRate();

  // Event status breakdown
  const eventStatusBreakdown = await prisma.event.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Payment status breakdown
  const paymentStatusBreakdown = await prisma.payment.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  // Category statistics
  const categoryStats = await prisma.eventCategory.findMany({
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      events: {
        _count: "desc",
      },
    },
  });

  return {
    overview: {
      totalUsers,
      totalHosts,
      totalEvents,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      activeEvents,
      completedEvents,
      pendingVerifications,
    },
    growth: {
      recentUsers,
      recentHosts,
      recentEvents,
      recentBookings,
      userGrowthRate,
      hostGrowthRate,
      eventGrowthRate,
      revenueGrowthRate,
    },
    eventBreakdown: eventStatusBreakdown.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    paymentBreakdown: paymentStatusBreakdown.map((item) => ({
      status: item.status,
      count: item._count.status,
    })),
    categoryStats: categoryStats.map((cat) => ({
      id: cat.id,
      name: cat.name,
      eventCount: cat._count.events,
    })),
    topRatedHosts,
    popularEvents: popularEvents.map((event) => ({
      ...event,
      bookingsCount: event._count.eventParticipants,
      reviewsCount: event._count.reviews,
    })),
    monthlyStats,
  };
};

// =====================================================
// HOST DASHBOARD STATISTICS
// =====================================================
const getHostDashboardStats = async (userId: string) => {
  // Get host info
  const host = await prisma.host.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!host) {
    throw new Error("Host profile not found");
  }

  const [
    totalEvents,
    activeEvents,
    completedEvents,
    upcomingEvents,
    totalBookings,
    totalRevenue,
    averageRating,
    totalReviews,
    recentBookings,
    eventPerformance,
    monthlyRevenue,
    upcomingEventsList,
  ] = await Promise.all([
    // Total Events
    prisma.event.count({
      where: { hostId: host.id },
    }),

    // Active Events
    prisma.event.count({
      where: { hostId: host.id, status: "OPEN" },
    }),

    // Completed Events
    prisma.event.count({
      where: { hostId: host.id, status: "COMPLETED" },
    }),

    // Upcoming Events
    prisma.event.count({
      where: {
        hostId: host.id,
        status: "OPEN",
        date: { gte: new Date() },
      },
    }),

    // Total Bookings across all events
    prisma.eventParticipant.count({
      where: {
        event: { hostId: host.id },
      },
    }),

    // Total Revenue
    prisma.payment.aggregate({
      where: {
        hostId: host.id,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),

    // Average Rating
    prisma.review.aggregate({
      where: { hostId: host.id },
      _avg: { rating: true },
    }),

    // Total Reviews
    prisma.review.count({
      where: { hostId: host.id },
    }),

    // Recent Bookings (Last 10)
    prisma.eventParticipant.findMany({
      where: {
        event: { hostId: host.id },
      },
      select: {
        id: true,
        status: true,
        bookingStatus: true,
        createdAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            joiningFee: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Event Performance
    prisma.event.findMany({
      where: { hostId: host.id },
      select: {
        id: true,
        name: true,
        date: true,
        status: true,
        joiningFee: true,
        maxParticipants: true,
        _count: {
          select: {
            eventParticipants: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        eventParticipants: {
          _count: "desc",
        },
      },
      take: 5,
    }),

    // Monthly Revenue (Last 6 months)
    getHostMonthlyRevenue(host.id),

    // Upcoming Events Details
    prisma.event.findMany({
      where: {
        hostId: host.id,
        status: "OPEN",
        date: { gte: new Date() },
      },
      select: {
        id: true,
        name: true,
        date: true,
        time: true,
        city: true,
        country: true,
        joiningFee: true,
        maxParticipants: true,
        _count: {
          select: {
            eventParticipants: true,
          },
        },
      },
      orderBy: { date: "asc" },
      take: 5,
    }),
  ]);

  // Booking status breakdown
  const bookingStatusBreakdown = await prisma.eventParticipant.groupBy({
    where: {
      event: { hostId: host.id },
    },
    by: ["bookingStatus"],
    _count: { bookingStatus: true },
  });

  return {
    overview: {
      totalEvents,
      activeEvents,
      completedEvents,
      upcomingEvents,
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      averageRating: averageRating._avg.rating || 0,
      totalReviews,
    },
    bookingBreakdown: bookingStatusBreakdown.map((item) => ({
      status: item.bookingStatus,
      count: item._count.bookingStatus,
    })),
    recentBookings,
    eventPerformance: eventPerformance.map((event) => ({
      ...event,
      bookingsCount: event._count.eventParticipants,
      reviewsCount: event._count.reviews,
      revenue: (event.joiningFee || 0) * event._count.eventParticipants,
      occupancyRate: event.maxParticipants
        ? (event._count.eventParticipants / event.maxParticipants) * 100
        : 0,
    })),
    monthlyRevenue,
    upcomingEvents: upcomingEventsList.map((event) => ({
      ...event,
      bookingsCount: event._count.eventParticipants,
      availableSlots: event.maxParticipants
        ? event.maxParticipants - event._count.eventParticipants
        : null,
    })),
  };
};

// =====================================================
// USER DASHBOARD STATISTICS
// =====================================================
const getUserDashboardStats = async (userId: string) => {
  const [
    totalBookings,
    upcomingEvents,
    completedEvents,
    cancelledBookings,
    totalSpent,
    recentBookings,
    upcomingEventsList,
    reviewsGiven,
    favoriteCategories,
  ] = await Promise.all([
    // Total Bookings
    prisma.eventParticipant.count({
      where: { userId },
    }),

    // Upcoming Events
    prisma.eventParticipant.count({
      where: {
        userId,
        event: {
          date: { gte: new Date() },
          status: "OPEN",
        },
      },
    }),

    // Completed Events
    prisma.eventParticipant.count({
      where: {
        userId,
        status: "COMPLETED",
      },
    }),

    // Cancelled Bookings
    prisma.eventParticipant.count({
      where: {
        userId,
        status: "CANCELLED",
      },
    }),

    // Total Amount Spent
    prisma.payment.aggregate({
      where: {
        userId,
        status: "COMPLETED",
      },
      _sum: { amount: true },
    }),

    // Recent Bookings (Last 10)
    prisma.eventParticipant.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        bookingStatus: true,
        createdAt: true,
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
            city: true,
            country: true,
            joiningFee: true,
            status: true,
            image: true,
            eventCategory: {
              select: {
                name: true,
              },
            },
            host: {
              select: {
                name: true,
                profilePhoto: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),

    // Upcoming Events Details
    prisma.eventParticipant.findMany({
      where: {
        userId,
        event: {
          date: { gte: new Date() },
          status: "OPEN",
        },
      },
      select: {
        id: true,
        bookingStatus: true,
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            time: true,
            city: true,
            country: true,
            location: true,
            image: true,
            joiningFee: true,
            eventCategory: {
              select: {
                name: true,
              },
            },
            host: {
              select: {
                name: true,
                contactNumber: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { event: { date: "asc" } },
      take: 5,
    }),

    // Reviews Given
    prisma.review.count({
      where: { userId },
    }),

    // Favorite Categories (Most booked)
    prisma.eventParticipant.groupBy({
      where: { userId },
      by: ["eventId"],
      _count: { eventId: true },
      orderBy: {
        _count: {
          eventId: "desc",
        },
      },
      take: 5,
    }),
  ]);

  // Get category names for favorite categories
  const categoryStats = await getCategoryStatsForUser(userId);

  return {
    overview: {
      totalBookings,
      upcomingEvents,
      completedEvents,
      cancelledBookings,
      totalSpent: totalSpent._sum.amount || 0,
      reviewsGiven,
    },
    recentBookings,
    upcomingEvents: upcomingEventsList,
    favoriteCategories: categoryStats,
  };
};

// =====================================================
// HELPER FUNCTIONS
// =====================================================

// Calculate growth rate (comparing last 30 days to previous 30 days)
const calculateGrowthRate = async (
  type: "user" | "host" | "event"
): Promise<number> => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  let currentPeriodCount = 0;
  let previousPeriodCount = 0;

  if (type === "user") {
    currentPeriodCount = await prisma.user.count({
      where: {
        role: UserRole.USER,
        createdAt: { gte: thirtyDaysAgo },
      },
    });
    previousPeriodCount = await prisma.user.count({
      where: {
        role: UserRole.USER,
        createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
      },
    });
  } else if (type === "host") {
    currentPeriodCount = await prisma.host.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    previousPeriodCount = await prisma.host.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });
  } else if (type === "event") {
    currentPeriodCount = await prisma.event.count({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    previousPeriodCount = await prisma.event.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    });
  }

  if (previousPeriodCount === 0) return currentPeriodCount > 0 ? 100 : 0;

  return (
    ((currentPeriodCount - previousPeriodCount) / previousPeriodCount) * 100
  );
};

// Calculate revenue growth rate
const calculateRevenueGrowthRate = async (): Promise<number> => {
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const currentRevenue = await prisma.payment.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: thirtyDaysAgo },
    },
    _sum: { amount: true },
  });

  const previousRevenue = await prisma.payment.aggregate({
    where: {
      status: "COMPLETED",
      createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
    },
    _sum: { amount: true },
  });

  const current = currentRevenue._sum.amount || 0;
  const previous = previousRevenue._sum.amount || 0;

  if (previous === 0) return current > 0 ? 100 : 0;

  return ((current - previous) / previous) * 100;
};

// Get monthly statistics for admin
const getMonthlyStatistics = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const stats = [];

  for (let i = 5; i >= 0; i--) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - i);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [users, hosts, events, bookings, revenue] = await Promise.all([
      prisma.user.count({
        where: {
          role: UserRole.USER,
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
      prisma.host.count({
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.event.count({
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.eventParticipant.count({
        where: { createdAt: { gte: startDate, lt: endDate } },
      }),
      prisma.payment.aggregate({
        where: {
          status: "COMPLETED",
          createdAt: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    stats.push({
      month: startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      users,
      hosts,
      events,
      bookings,
      revenue: revenue._sum.amount || 0,
    });
  }

  return stats;
};

// Get monthly revenue for host
const getHostMonthlyRevenue = async (hostId: string) => {
  const stats = [];

  for (let i = 5; i >= 0; i--) {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - i);
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [bookings, revenue] = await Promise.all([
      prisma.eventParticipant.count({
        where: {
          event: { hostId },
          createdAt: { gte: startDate, lt: endDate },
        },
      }),
      prisma.payment.aggregate({
        where: {
          hostId,
          status: "COMPLETED",
          createdAt: { gte: startDate, lt: endDate },
        },
        _sum: { amount: true },
      }),
    ]);

    stats.push({
      month: startDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      }),
      bookings,
      revenue: revenue._sum.amount || 0,
    });
  }

  return stats;
};

// Get category statistics for user
const getCategoryStatsForUser = async (userId: string) => {
  const categories = await prisma.eventParticipant.findMany({
    where: { userId },
    select: {
      event: {
        select: {
          eventCategory: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
  });

  const categoryCount: Record<
    string,
    { id: string; name: string; count: number }
  > = {};

  categories.forEach((participant) => {
    if (participant.event.eventCategory) {
      const cat = participant.event.eventCategory;
      if (!categoryCount[cat.id]) {
        categoryCount[cat.id] = { id: cat.id, name: cat.name, count: 0 };
      }
      categoryCount[cat.id].count++;
    }
  });

  return Object.values(categoryCount)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
};

export const dashboardService = {
  getDashboardStats,
  getAdminDashboardStats,
  getHostDashboardStats,
  getUserDashboardStats,
};
