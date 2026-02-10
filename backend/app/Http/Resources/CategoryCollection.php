<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class CategoryCollection extends ResourceCollection
{
    /**
     * Transform the resource collection into an array.
     *
     * @return array<int, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'data' => CategoryResource::collection($this->collection),
            'pagination' => [
                'current_page' => $this->currentPage(),
                'last_page' => $this->lastPage(),
                'per_page' => $this->perPage(),
                'total' => $this->total(),
                'first_page_url' => $this->url(1),
                'last_page_url' => $this->url($this->lastPage()),
                'next_page_url' => $this->nextPageUrl(),
                'prev_page_url' => $this->previousPageUrl(),
            ],
        ];
    }
}

