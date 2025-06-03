import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/auth/home";
import NotFound from "./pages/NotFound";
import Register from "./pages/auth/RegisterAs";
import Login from "./pages/auth/Login";
import CounselorRegister from "./pages/counselor/counselor-complete-profile";
import EmailVerification from "./pages/auth/EmailVerification";
import ClientCompleteProfile from "./pages/client/Client-complete-profile";
import ClientDashboard from "./pages/client/ClientDashboard";
import CounselorPosts from "./pages/client/CounselorPosts";
import CounselorDashboard from "./pages/counselor/CounselorDashboard";
import CounselorProfile from "./pages/counselor/CounelorDetail";
import CounselorSchedule from "./pages/counselor/CounselorSchedule";
import CounselorFeedback from "./pages/client/CounselorFeedback";
import FinalSessionSet from "./pages/FinalSessionSet";
import CounselorArticles from "./pages/counselor/CounselorArticles";
import BookingSession from "./pages/client/BookSession";
import UserRegister from "./pages/auth/signup";
import ResetPassword from "./pages/auth/ResetPassword";
import ResetSuccess from "./pages/auth/ResetPasswordSuccess";
import ResetPasswordForm from "./pages/auth/ResetPasswordForm";
import Calendar from "./pages/counselor/Calendar";

import AdminPanel from "./pages/admin/adminPanel";
import CounselorDetail from "./pages/admin/counselor.detail";
import PaymentSuccess from "./pages/client/paymentSuccess";
import AdministrativeProfessional from "./pages/careers/AdministrativeProfessional";
import Careers from "./pages/careers";
import ClinicalSocialWorker from "./pages/careers/ClinicalSocialWorker";
import Psychiatrist from "./pages/careers/Psychiatrist";
import LicensedTherapist from "./pages/careers/LicensedTherapist";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfUse from "./pages/TermsOsUse";
import ReschedulePage from "./pages/client/reschedule";
import SelectTimeSlot from "./pages/client/reschedule";
import BookingSuccess from "./pages/BookingSuccess";
const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <div className="min-h-screen bg-white">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/about" element={<Index />} />
            <Route path="/therapist" element={<Index />} />
            <Route path="/services" element={<Index />} />
            <Route path="/select-role" element={<Register />} />
            <Route path="/signup" element={<UserRegister />} />
            <Route
              path="/counselor/complete-profile"
              element={<CounselorRegister />}
            />
            <Route path="/terms" element={<TermsOfUse />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/login" element={<Login />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/reset-success" element={<ResetSuccess />} />
            <Route path="/reset-form" element={<ResetPasswordForm />} />
            <Route path="/verify-email" element={<EmailVerification />} />{" "}
            <Route
              path="/client-complete-profile"
              element={<ClientCompleteProfile />}
            />
            <Route path="/client-dashboard" element={<ClientDashboard />} />
            <Route path="/counselor-posts" element={<CounselorPosts />} />
            <Route
              path="/counselor-dashboard"
              element={<CounselorDashboard />}
            />
            <Route path="/counselor-profile" element={<CounselorProfile />} />
            <Route path="/counselor-schedule" element={<CounselorSchedule />} />
            <Route path="/counselor-feedback" element={<CounselorFeedback />} />
            <Route path="/final-session-set" element={<FinalSessionSet />} />
            <Route path="/counselor-articles" element={<CounselorArticles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/book-session" element={<BookingSession />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/adminPanel" element={<AdminPanel />} />
            <Route path="/Counselor/:userId" element={<CounselorDetail />} />
            <Route path="/payment/success" element={<PaymentSuccess />} />
            <Route path="/careers/therapist" element={<LicensedTherapist />} />
            <Route path="/careers/psychiatrist" element={<Psychiatrist />} />
            <Route path="/reschedule" element={<SelectTimeSlot />} />
            <Route path="/booking-success" element={<BookingSuccess />} />
            <Route
              path="/careers/social-worker"
              element={<ClinicalSocialWorker />}
            />
            <Route
              path="/careers/administrative"
              element={<AdministrativeProfessional />}
            />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
