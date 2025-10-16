export const API_ENDPOINTS = {
    // ========== Authentication Endpoints ==========
    auth: {
        login: () => `/user/login`,
        loginOtp: () => `/user/login/otp`,
        sendOtp: () => `/user/login/send-otp`,
        logout: () => `/auth/logout`,
    },

    // ========== User Management Endpoints ==========
    users: {

        registerRto: () => `/user/register/rto`,
        registerCollector: () => `/user/register/collector`,
        registerDepartment: () => `/user/register/department`,
        registerCommissioner: () => `/user/register/commissioner`,
        registerOfficer: () => `/user/register/designated-officer`,
        byRole: (role) => `/user/role/${role}`,

        signup: () => `/user/signup`,
        requisitioningSignin: () => `/requisitioningAndDepartment/signin`,
        requisitioningCreate: () => `/requisitioningAndDepartment/create`,
    },

    // ========== Vehicle Management Endpoints ==========
    vehicles: {
        create: () => `/vehicle/create`,
        list: () => `/vehicle/all`,
        details: (id) => `/vehicle/${id}`,
    },

    // ========== Request Events (PDF Letters) Endpoints ==========
    requestEvents: {
        create: () => `/rto/request_event`,
        list: () => `/rto/allrequest`,
        details: (id) => `/rto/viewrequest/${id}`,
        viewPdf: (id) => `/rto/${id}/pdf/view`,
        downloadPdf: (id) => `/rto/${id}/pdf/download`,
        approve: (id) => `/rto/${id}/approve`,

    },

    // ========== Events Management Endpoints ==========
    events: {
        create: () => `/api/events`,
        list: () => `/api/events`,
        details: (id) => `/api/events/singleEvent/${id}`,
        update: (id) => `/api/events/${id}`,
        viewPdf: (id) => `/api/events/${id}/pdf/view`,        // This should match your backend
        downloadPdf: (id) => `/api/events/${id}/pdf`,
         delete: (id) => `/api/events/${id}`,
    },

     utilizations: {
        create: () => `/api/utilizations`,
        list: () => `/api/utilizations`,
        details: (id) => `/api/utilizations/${id}`,
        update: (id) => `/api/utilizations/${id}`,
        delete: (id) => `/api/utilizations/${id}`,
        byEvent: (eventId) => `/api/utilizations/event/${eventId}`,
        byStatus: (status) => `/api/utilizations/status/${status}`,
        approve: (id) => `/api/utilizations/${id}/approve`,
        reject: (id) => `/api/utilizations/${id}/reject`,
    },
};
