<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CategoryResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'parent_id' => $this->parent_id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'short_description' => $this->short_description,
            'type' => $this->type,
            'icon' => $this->icon,
            'image' => $this->image ? url('storage/' . $this->image) : null,
            'banner' => $this->banner ? url('storage/' . $this->banner) : null,
            'color' => $this->color,
            'attributes' => $this->attributes,
            'sort_order' => $this->sort_order,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'show_in_menu' => $this->show_in_menu,
            'meta_title' => $this->meta_title,
            'meta_description' => $this->meta_description,
            'meta_keywords' => $this->meta_keywords,
            'depth' => $this->depth,
            
            // Calculated fields
            'product_count' => $this->getProductCount(),
            'full_path' => $this->full_path,
            
            // Relationships
            'parent' => new CategoryResource($this->whenLoaded('parent')),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
            'products' => ProductResource::collection($this->whenLoaded('products')),
            
            // Timestamps
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}

