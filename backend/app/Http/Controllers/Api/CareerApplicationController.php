<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CareerApplication;
use App\Models\User;
use App\Notifications\NewCareerApplicationNotification;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class CareerApplicationController extends Controller
{
    /**
     * Get available job positions (Public)
     */
    public function jobPositions(): JsonResponse
    {
        // These should match the jobs displayed on the Careers page
        $positions = [
            'Network Engineer',
            'Customer Support Specialist',
            'Sales Executive',
            'Marketing Manager',
            'Field Technician',
            'Software Developer',
            'System Administrator',
            'Data Analyst',
            'IT Security Specialist',
            'Accountant',
            'Human Resources Manager',
            'Graphic Designer',
            'Content Creator',
            'Project Manager',
            'DevOps Engineer',
        ];

        return response()->json([
            'success' => true,
            'data' => $positions,
        ]);
    }

    /**
     * Submit a new career application (Public API)
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'job_title' => 'required|string|max:255',
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'linkedin_url' => 'nullable|url|max:255',
            'portfolio_url' => 'nullable|url|max:255',
            'cover_letter' => 'nullable|string',
            'cv' => 'required|file|mimes:pdf,doc,docx|max:10240',
            'certificates' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png|max:10240',
            'additional_documents' => 'nullable|file|mimes:pdf,doc,docx,jpg,jpeg,png,zip|max:20480',
        ], [
            'cv.required' => 'Please upload your CV/Resume',
            'cv.mimes' => 'CV must be a PDF, DOC, or DOCX file',
            'cv.max' => 'CV file size must be less than 10MB',
            'job_title.required' => 'Please select a job position',
            'full_name.required' => 'Please enter your full name',
            'email.required' => 'Please enter your email address',
            'email.email' => 'Please enter a valid email address',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();

        // Generate unique application number
        $data['application_number'] = CareerApplication::generateApplicationNumber();

        // Handle file uploads
        $data['cv_path'] = $this->storeFile($request->file('cv'), 'cv');
        $data['certificates_path'] = $this->storeFile($request->file('certificates'), 'certificates');
        $data['additional_documents_path'] = $this->storeFile($request->file('additional_documents'), 'additional');

        // Create career application
        $application = CareerApplication::create([
            'application_number' => $data['application_number'],
            'job_title' => $data['job_title'],
            'full_name' => $data['full_name'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'linkedin_url' => $data['linkedin_url'] ?? null,
            'portfolio_url' => $data['portfolio_url'] ?? null,
            'cover_letter' => $data['cover_letter'] ?? null,
            'cv_path' => $data['cv_path'],
            'certificates_path' => $data['certificates_path'],
            'additional_documents_path' => $data['additional_documents_path'],
            'status' => 'pending',
        ]);

        // Notify HR/Admin of new application
        $this->notifyHR($application);

        return response()->json([
            'success' => true,
            'message' => 'Your application has been submitted successfully!',
            'data' => [
                'application_number' => $application->application_number,
                'job_title' => $application->job_title,
                'submitted_at' => $application->created_at->toISOString(),
            ],
        ], 201);
    }

    /**
     * Store uploaded file
     */
    private function storeFile($file, string $type): ?string
    {
        if (!$file) {
            return null;
        }

        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path = $file->storeAs("career-applications/{$type}", $filename, 'public');

        return $path;
    }

    /**
     * Notify HR team of new application
     */
    private function notifyHR(CareerApplication $application): void
    {
        $hrUsers = User::role(['admin', 'hr'])
            ->where('is_active', true)
            ->get();

        foreach ($hrUsers as $user) {
            $user->notify(new NewCareerApplicationNotification($application));
        }
    }

    /**
     * Get application status (Public - by application number and email)
     */
    public function checkStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_number' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = CareerApplication::where('application_number', $request->application_number)
            ->where('email', $request->email)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'application_number' => $application->application_number,
                'job_title' => $application->job_title,
                'full_name' => $application->full_name,
                'status' => $application->status,
                'status_label' => $application->status_label,
                'submitted_at' => $application->created_at->toISOString(),
                'reviewed_at' => $application->reviewed_at?->toISOString(),
            ],
        ]);
    }

    /**
     * Withdraw application (by applicant)
     */
    public function withdraw(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'application_number' => 'required|string',
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $application = CareerApplication::where('application_number', $request->application_number)
            ->where('email', $request->email)
            ->first();

        if (!$application) {
            return response()->json([
                'success' => false,
                'message' => 'Application not found',
            ], 404);
        }

        if ($application->status === 'withdrawn') {
            return response()->json([
                'success' => false,
                'message' => 'Application already withdrawn',
            ], 400);
        }

        $application->update(['status' => 'withdrawn']);

        return response()->json([
            'success' => true,
            'message' => 'Application withdrawn successfully',
        ]);
    }

    /**
     * Get available statuses (Public)
     */
    public function statuses(): JsonResponse
    {
        return response()->json([
            'success' => true,
            'data' => CareerApplication::STATUSES,
        ]);
    }
}

