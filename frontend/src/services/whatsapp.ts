import axios from "@/lib/axios";

export interface WhatsAppOption {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface WhatsAppMessage {
  id: number;
  phone: string | null;
  name: string | null;
  email: string | null;
  message: string;
  message_type: "predefined" | "custom";
  status: "pending" | "contacted" | "converted" | "failed";
  source: string | null;
  page_url: string | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export const whatsappService = {
  // Get predefined message options
  async getOptions(): Promise<{ data: { success: boolean; data: WhatsAppOption[]; whatsapp_number: string } }> {
    return axios.get("/whatsapp/options");
  },

  // Log a WhatsApp message when user clicks the button
  async logMessage(data: {
    message: string;
    message_type: "predefined" | "custom";
    name?: string;
    email?: string;
    phone?: string;
    page_url?: string;
    vlc_vid?: string;
    device_type?: string;
  }): Promise<{ data: { success: boolean; data: WhatsAppMessage } }> {
    return axios.post("/whatsapp/messages", data);
  },

  // Admin: Get all WhatsApp messages
  async getMessages(params?: {
    status?: string;
    message_type?: string;
    search?: string;
    from_date?: string;
    to_date?: string;
    page?: number;
    per_page?: number;
  }): Promise<{ data: { success: boolean; data: WhatsAppMessage[]; meta: any } }> {
    return axios.get("/admin/whatsapp/messages", { params });
  },

  // Admin: Get message statistics
  async getStatistics(): Promise<{ data: { success: boolean; data: any } }> {
    return axios.get("/admin/whatsapp/messages/statistics");
  },

  // Admin: Update message status
  async updateMessage(
    id: number,
    data: { status: "pending" | "contacted" | "converted" | "failed" }
  ): Promise<{ data: { success: boolean; data: WhatsAppMessage } }> {
    return axios.put(`/admin/whatsapp/messages/${id}`, data);
  },

  // Admin: Mark as contacted
  async markContacted(id: number): Promise<{ data: { success: boolean; data: WhatsAppMessage } }> {
    return axios.post(`/admin/whatsapp/messages/${id}/contacted`);
  },

  // Admin: Mark as converted
  async markConverted(id: number, data?: { subscription_id?: number }): Promise<{ data: { success: boolean; data: WhatsAppMessage } }> {
    return axios.post(`/admin/whatsapp/messages/${id}/converted`, data);
  },

  // Admin: Delete message
  async deleteMessage(id: number): Promise<{ data: { success: boolean } }> {
    return axios.delete(`/admin/whatsapp/messages/${id}`);
  },

  // Get WhatsApp URL for external navigation
  getWhatsAppUrl(phone: string = "254726888777", message?: string): string {
    const baseUrl = "https://wa.me";
    const encodedPhone = phone.replace(/\D/g, "");
    const url = new URL(`${baseUrl}/${encodedPhone}`);
    
    if (message) {
      url.searchParams.set("text", message);
    }
    
    return url.toString();
  },

  // Open WhatsApp in new tab
  openWhatsApp(phone: string = "254726888777", message?: string): void {
    const url = this.getWhatsAppUrl(phone, message);
    window.open(url, "_blank", "noopener,noreferrer");
  },
};

export default whatsappService;

