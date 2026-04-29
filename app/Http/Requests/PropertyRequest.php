<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class PropertyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $method = $this->route()->getActionMethod();

        return match ($method) {
            'store' => [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'price' => 'required|numeric|min:0',
                'currency' => 'nullable|string|max:10',
                'type' => 'required|in:sale,rent',
                'property_type' => [
                    'required',
                    'string',
                    'max:100',
                    Rule::in(['apartment', 'house', 'villa', 'shop', 'store', 'land', 'farm']),
                ],
                'area' => 'nullable|numeric|min:1',
                'region_id' => 'required|exists:regions,id',
                'location' => 'nullable|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'images' => 'nullable|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'images_base64' => 'nullable|array|max:10',
                'images_base64.*' => 'nullable|string',
            ],
            'update' => [
                'title' => 'sometimes|string|max:255',
                'description' => 'sometimes|string',
                'price' => 'sometimes|numeric|min:0',
                'currency' => 'nullable|string|max:10',
                'type' => 'sometimes|in:sale,rent',
                'property_type' => [
                    'sometimes',
                    'string',
                    'max:100',
                    Rule::in(['apartment', 'house', 'villa', 'shop', 'store', 'land', 'farm']),
                ],
                'area' => 'sometimes|nullable|numeric|min:1',
                'region_id' => 'sometimes|exists:regions,id',
                'location' => 'sometimes|nullable|string|max:255',
                'area' => 'nullable|numeric|min:1',
                'region_id' => 'sometimes|exists:regions,id',
                'location' => 'nullable|string|max:255',
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'images' => 'sometimes|array|max:10',
                'images.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:2048',
                'images_base64' => 'sometimes|array|max:10',
                'images_base64.*' => 'nullable|string',
            ],
            default => [],
        };
    }

    public function messages(): array
    {
        return [
            'title.required' => 'العنوان مطلوب',
            'title.max' => 'العنوان يجب ألا يتجاوز 255 حرف',
            'description.required' => 'الوصف مطلوب',
            'price.required' => 'السعر مطلوب',
            'price.numeric' => 'السعر يجب أن يكون رقماً',
            'price.min' => 'السعر يجب أن يكون موجباً',
            'type.required' => 'النوع مطلوب',
            'type.in' => 'النوع يجب أن يكون sale أو rent',
            'property_type.required' => 'نوع العقار مطلوب',
            'property_type.in' => 'نوع العقار غير صالح',
            'area.numeric' => 'المساحة يجب أن تكون رقماً',
            'area.min' => 'المساحة يجب أن تكون أكبر من 0',
            'region_id.required' => 'المنطقة مطلوبة',
            'region_id.exists' => 'المنطقة غير موجودة',
            'location.string' => 'الموقع يجب أن يكون نصاً',
            'images.array' => 'الصور يجب أن تكون مصفوفة',
            'images.*.image' => 'الملف يجب أن يكون صورة',
            'images.*.mimes' => 'صيغة الصورة يجب أن تكون jpeg, png, jpg, gif, أو webp',
            'images.*.max' => 'حجم الصورة يجب ألا يتجاوز 2 ميجابايت',
        ];
    }
}
