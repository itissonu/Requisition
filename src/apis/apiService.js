import axios from "axios";
import { API_ENDPOINTS } from "./endpoint.js";

const api = axios.create({
 // baseURL: "https://vehicle-backend-d3l9.onrender.com/Requisition",
 baseURL: 'http://localhost:8091/Requisition',
  withCredentials: true,
   headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json, text/plain, */*',
  },
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token'); // or sessionStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
   
    if (error.response && (error.response.status === 403 )) {
     
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      alert('Your session has expired. Please login again.');
      window.location.href = '/login'; 
    }

    return Promise.reject(error);
  }
);


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const authAPI = {
  login: credentials => api.post(API_ENDPOINTS.auth.login(), credentials),
  loginWithOtp: data => api.post(API_ENDPOINTS.auth.loginOtp(), data),
  sendOtp: data => api.post(API_ENDPOINTS.auth.sendOtp(), data),
  logout: () => api.post(API_ENDPOINTS.auth.logout()),
};

// User Management
export const userAPI = {
  registerRto: data => api.post(API_ENDPOINTS.users.registerRto(), data),
  registerCollector: data => api.post(API_ENDPOINTS.users.registerCollector(), data),
  registerCommissioner: data => api.post(API_ENDPOINTS.users.registerCommissioner(), data),  // Add this
  registerDepartment: data => api.post(API_ENDPOINTS.users.registerDepartment(), data),
  registerOfficer: data => api.post(API_ENDPOINTS.users.registerOfficer(), data),
  getUsersByRole: role => api.get(API_ENDPOINTS.users.byRole(role)),
  signup: data => api.post(API_ENDPOINTS.users.signup(), data),
  requisitionSignin: data => api.post(API_ENDPOINTS.users.requisitionSignin(), data),
  requisitionCreate: data => api.post(API_ENDPOINTS.users.requisitionCreate(), data),
  getRtosInMyDistrict: () => api.get('/user/rtos/my-district', {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
};

// Vehicle Management
export const vehicleAPI = {
  create: data => api.post(API_ENDPOINTS.vehicles.create(), data),
  list: () => api.get(API_ENDPOINTS.vehicles.list()),
  details: id => api.get(API_ENDPOINTS.vehicles.details(id)),
};

// Request Events (PDF letters)
export const requestEventAPI = {
  create: formData => api.post(API_ENDPOINTS.requestEvents.create(), formData, {
    headers: { "Content-Type": "multipart/form-data" },
  }),
  list: () => api.get(API_ENDPOINTS.requestEvents.list(), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  details: id => api.get(API_ENDPOINTS.requestEvents.details(id)),
  viewPdf: id => api.get(API_ENDPOINTS.requestEvents.viewPdf(id), { responseType: "blob" }),
  downloadPdf: id => api.get(API_ENDPOINTS.requestEvents.downloadPdf(id), { responseType: "blob" }),
  approve: (id, data) => api.patch(API_ENDPOINTS.requestEvents.approve(id), data),
};


// Events Management with multipart form data
export const eventAPI = {
  create: formData => api.post(
    API_ENDPOINTS.events.create(),
    formData,
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    }
  ),
  list: () => api.get(API_ENDPOINTS.events.list(),
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    }),
  delete: id => api.delete(API_ENDPOINTS.events.delete(id), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),

  details: id => api.get(API_ENDPOINTS.events.details(id),
    {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeader()
      }
    }),

  update: (id, data) => api.patch(API_ENDPOINTS.events.update(id), data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),

  viewPdf: id => api.get(`${API_ENDPOINTS.events.viewPdf(id)}`, { responseType: "blob" }),
  downloadPdf: (id) => api.get(API_ENDPOINTS.events.downloadPdf(id), { responseType: "blob" }),
};



// Bill Sanction API endpoints
export const billSanctionAPI = {
  // Create a new bill (Commissioner for FINAL, RTO for ADVANCE)
  create: data => api.post('/api/bill-sanctions', data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),

  // Get all bills (role-based filtering applied on backend)
  list: () => api.get('/api/bill-sanctions', {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getById: id => api.get(`/api/bill-sanctions/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getByUtilization: utilizationId => api.get(`/api/bill-sanctions/utilization/${utilizationId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getByStatus: status => api.get(`/api/bill-sanctions/status/${status}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getByType: type => api.get(`/api/bill-sanctions/type/${type}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  markAsPaid: (id, remarks) => api.patch(`/api/bill-sanctions/${id}/mark-paid`, null, {
    params: { remarks },
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getTotalAmount: (utilizationId, type) => api.get(`/api/bill-sanctions/utilization/${utilizationId}/total/${type}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  delete: id => api.delete(`/api/bill-sanctions/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  })
};

// Advance Payment Request API endpoints
export const advancePaymentAPI = {

  create: data => api.post('/api/advance-payments', data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  list: () => api.get('/api/advance-payments', {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getById: id => api.get(`/api/advance-payments/${id}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getByStatus: status => api.get(`/api/advance-payments/status/${status}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  getByEvent: eventId => api.get(`/api/advance-payments/event/${eventId}`, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  approve: (id, remarks) => api.put(`/api/advance-payments/${id}/approve`, null, {
    params: { remarks },
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  reject: (id, remarks) => api.put(`/api/advance-payments/${id}/reject`, null, {
    params: { remarks },
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


  markAsPaid: (id, remarks) => api.put(`/api/advance-payments/${id}/mark-paid`, null, {
    params: { remarks },
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  })
};



export const utilizationAPI = {
  create: data => api.post(API_ENDPOINTS.utilizations.create(), data, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  list: () => api.get(API_ENDPOINTS.utilizations.list(), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  details: id => api.get(API_ENDPOINTS.utilizations.details(id), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  update: (id, data) => api.put(API_ENDPOINTS.utilizations.update(id), data),
  delete: id => api.delete(API_ENDPOINTS.utilizations.delete(id), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  getByEvent: eventId => api.get(API_ENDPOINTS.utilizations.byEvent(eventId), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  getByStatus: status => api.get(API_ENDPOINTS.utilizations.byStatus(status), {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  approve: (id, approvedBy) =>
    api.put(
      API_ENDPOINTS.utilizations.approve(id),
      null,
      {
        params: { approvedBy },
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        }
      }
    ),

  reject: (id, remarks) => api.put(API_ENDPOINTS.utilizations.reject(id), null, {
    params: { remarks }
  }),
  commissionerApprove: (id, commissionerId, remarks) =>
    api.patch(
      `/api/utilizations/${id}/commissioner-approve`,
      null,
      {
        params: { commissionerApprovedBy: commissionerId, remarks },
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeader()
        }
      }
    ),

  commissionerReject: (id, remarks) => api.patch(`/api/utilizations/${id}/commissioner-reject`, null, {
    params: { remarks }
  }, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),
  completePayment: (id, remarks) =>
    api.put(`/api/utilizations/${id}/complete-payment`, null, { params: { remarks } }),

  getCommissionerApproved: () => api.get('/api/utilizations/status/COMMISSIONER_APPROVED', {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeader()
    }
  }),


};
