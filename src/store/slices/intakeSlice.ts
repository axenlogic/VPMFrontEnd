import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { IntakeService } from '@/services/intakeService';
import { IntakeFormData, IntakeSubmissionResponse, IntakeStatusResponse } from '@/types/intake';

/**
 * Intake Form State Interface
 */
interface IntakeState {
  // Form submission state
  isSubmitting: boolean;
  submitError: string | null;
  submissionSuccess: boolean;
  submittedUuid: string | null;

  // Status check state
  isCheckingStatus: boolean;
  statusCheckError: string | null;
  statusData: IntakeStatusResponse | null;

  // Form data (for potential draft saving)
  formData: Partial<IntakeFormData> | null;
}

const initialState: IntakeState = {
  isSubmitting: false,
  submitError: null,
  submissionSuccess: false,
  submittedUuid: null,
  isCheckingStatus: false,
  statusCheckError: null,
  statusData: null,
  formData: null,
};

/**
 * Async Thunk: Submit Intake Form
 * 
 * Handles form submission with proper error handling and loading states.
 * This is a public endpoint - no authentication required.
 */
export const submitIntakeForm = createAsyncThunk<
  IntakeSubmissionResponse,
  { formData: IntakeFormData; captchaToken?: string },
  { rejectValue: string }
>(
  'intake/submitForm',
  async ({ formData, captchaToken }, { rejectWithValue }) => {
    try {
      const response = await IntakeService.submitIntakeForm(formData, captchaToken);
      return response;
    } catch (error: any) {
      // Extract error message from API response or use default
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to submit intake form. Please try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Async Thunk: Check Intake Status
 * 
 * Checks the status of a submitted intake form using the student UUID.
 * This is a public endpoint - no authentication required.
 */
export const checkIntakeStatus = createAsyncThunk<
  IntakeStatusResponse,
  string,
  { rejectValue: string }
>(
  'intake/checkStatus',
  async (studentUuid, { rejectWithValue }) => {
    try {
      const response = await IntakeService.checkIntakeStatus(studentUuid);
      return response;
    } catch (error: any) {
      // Extract error message from API response or use default
      const errorMessage = error?.response?.data?.detail || error?.message || 'Failed to check intake status. Please verify the UUID and try again.';
      return rejectWithValue(errorMessage);
    }
  }
);

/**
 * Intake Slice
 * 
 * Manages all intake form related state including:
 * - Form submission
 * - Status checking
 * - Error handling
 * - Loading states
 */
const intakeSlice = createSlice({
  name: 'intake',
  initialState,
  reducers: {
    /**
     * Clear submission state
     * Useful when navigating away or starting a new submission
     */
    clearSubmissionState: (state) => {
      state.isSubmitting = false;
      state.submitError = null;
      state.submissionSuccess = false;
      state.submittedUuid = null;
    },

    /**
     * Clear status check state
     */
    clearStatusState: (state) => {
      state.isCheckingStatus = false;
      state.statusCheckError = null;
      state.statusData = null;
    },

    /**
     * Save form draft (for future use)
     */
    saveFormDraft: (state, action: PayloadAction<Partial<IntakeFormData>>) => {
      state.formData = action.payload;
    },

    /**
     * Clear form draft
     */
    clearFormDraft: (state) => {
      state.formData = null;
    },

    /**
     * Reset all intake state
     */
    resetIntakeState: (state) => {
      return initialState;
    },
  },
  extraReducers: (builder) => {
    // Submit form reducers
    builder
      .addCase(submitIntakeForm.pending, (state) => {
        state.isSubmitting = true;
        state.submitError = null;
        state.submissionSuccess = false;
      })
      .addCase(submitIntakeForm.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.submissionSuccess = true;
        state.submittedUuid = action.payload.student_uuid;
        state.submitError = null;
      })
      .addCase(submitIntakeForm.rejected, (state, action) => {
        state.isSubmitting = false;
        state.submitError = action.payload || 'Failed to submit intake form';
        state.submissionSuccess = false;
        state.submittedUuid = null;
      });

    // Check status reducers
    builder
      .addCase(checkIntakeStatus.pending, (state) => {
        state.isCheckingStatus = true;
        state.statusCheckError = null;
      })
      .addCase(checkIntakeStatus.fulfilled, (state, action) => {
        state.isCheckingStatus = false;
        state.statusData = action.payload;
        state.statusCheckError = null;
      })
      .addCase(checkIntakeStatus.rejected, (state, action) => {
        state.isCheckingStatus = false;
        state.statusCheckError = action.payload || 'Failed to check intake status';
        state.statusData = null;
      });
  },
});

export const {
  clearSubmissionState,
  clearStatusState,
  saveFormDraft,
  clearFormDraft,
  resetIntakeState,
} = intakeSlice.actions;

export default intakeSlice.reducer;

