<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Contracts\Validation\Validator;
class VerifyAnswersRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
      public function rules(): array
    {
        return [
            'identifier' => 'required|string',
            'answer_1'   => 'required|string',
            'answer_2'   => 'required|string',
        ];
    }

    public function messages(): array
    {
        return [
            'identifier.required' => 'المعرف مطلوب',
            'answer_1.required'   => 'إجابة السؤال الأول مطلوبة',
            'answer_2.required'   => 'إجابة السؤال الثاني مطلوبة',
        ];
    }

    protected function failedValidation(Validator $validator)
    {
        throw new HttpResponseException(response()->json([
            'success' => false,
            'message' => '. خطأ في التحقق من صحة البيانات',
            'errors'  => $validator->errors()
        ], 422));
    }
}
