<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Kalnoy\Nestedset\NodeTrait; // composer require kalnoy/nestedset

class Category extends Model
{
    use HasFactory, SoftDeletes, NodeTrait;

    protected $fillable = [
        'parent_id',
        'name',
        'slug',
        'description',
        'short_description',
        'type',
        'icon',
        'image',
        'banner',
        'color',
        'attributes',
        'sort_order',
        'is_featured',
        'is_active',
        'show_in_menu',
        'meta_title',
        'meta_description',
        'meta_keywords',
    ];

    protected function casts(): array
    {
        return [
            'attributes' => 'array',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
            'show_in_menu' => 'boolean',
        ];
    }

    // ============================================
    // RELATIONSHIPS
    // ============================================

    /**
     * Get all products in this category
     */
    public function products()
    {
        return $this->hasMany(Product::class);
    }

    /**
     * Get active products only
     */
    public function activeProducts()
    {
        return $this->hasMany(Product::class)->where('is_active', true);
    }

    /**
     * Get all products including from subcategories
     */
    public function allProducts()
    {
        $categoryIds = $this->descendants()->pluck('id')->push($this->id);
        return Product::whereIn('category_id', $categoryIds);
    }

    // ============================================
    // SCOPES
    // ============================================

    /**
     * Scope to get active categories
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    /**
     * Scope to get featured categories
     */
    public function scopeFeatured($query)
    {
        return $query->where('is_featured', true);
    }

    /**
     * Scope to filter by type
     */
    public function scopeOfType($query, $type)
    {
        return $query->where('type', $type);
    }

    /**
     * Scope to get menu categories
     */
    public function scopeInMenu($query)
    {
        return $query->where('show_in_menu', true);
    }

    /**
     * Scope to get root categories
     */
    public function scopeRoots($query)
    {
        return $query->whereNull('parent_id');
    }

    // ============================================
    // ACCESSORS & MUTATORS
    // ============================================

    /**
     * Get full category path
     */
    public function getFullPathAttribute()
    {
        $ancestors = $this->ancestors()->pluck('name')->toArray();
        $ancestors[] = $this->name;
        return implode(' > ', $ancestors);
    }

    /**
     * Get category URL
     */
    public function getUrlAttribute()
    {
        return route('categories.show', $this->slug);
    }

    /**
     * Get image URL
     */
    public function getImageUrlAttribute()
    {
        if ($this->image) {
            return url('storage/' . $this->image);
        }
        return null;
    }

    /**
     * Get banner URL
     */
    public function getBannerUrlAttribute()
    {
        if ($this->banner) {
            return url('storage/' . $this->banner);
        }
        return null;
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    /**
     * Check if category has products
     */
    public function hasProducts()
    {
        return $this->products()->exists();
    }

    /**
     * Get product count
     */
    public function getProductCount()
    {
        return $this->products()->count();
    }

    /**
     * Get all product count including subcategories
     */
    public function getAllProductCount()
    {
        return $this->allProducts()->count();
    }

    /**
     * Check if category has subcategories
     */
    public function hasChildren()
    {
        return $this->children()->exists();
    }

    /**
     * Get breadcrumb array
     */
    public function getBreadcrumbs()
    {
        $breadcrumbs = [];
        
        foreach ($this->ancestors as $ancestor) {
            $breadcrumbs[] = [
                'name' => $ancestor->name,
                'url' => $ancestor->url,
            ];
        }
        
        $breadcrumbs[] = [
            'name' => $this->name,
            'url' => $this->url,
        ];
        
        return $breadcrumbs;
    }

    /**
     * Get category tree for dropdowns
     */
    public static function getTreeOptions($selectedId = null, $excludeId = null)
    {
        $categories = self::active()->defaultOrder()->get()->toTree();
        $options = [];
        
        self::buildTreeOptions($categories, $options, 0, $selectedId, $excludeId);
        
        return $options;
    }

    /**
     * Build tree options recursively
     */
    private static function buildTreeOptions($categories, &$options, $level = 0, $selectedId = null, $excludeId = null)
    {
        foreach ($categories as $category) {
            if ($excludeId && $category->id === $excludeId) {
                continue;
            }
            
            $options[] = [
                'id' => $category->id,
                'name' => str_repeat('— ', $level) . $category->name,
                'level' => $level,
                'selected' => $category->id === $selectedId,
            ];
            
            if ($category->children) {
                self::buildTreeOptions($category->children, $options, $level + 1, $selectedId, $excludeId);
            }
        }
    }

    /**
     * Get category attributes by key
     */
    public function getAttribute($key, $default = null)
    {
        $attributes = $this->attributes ?? [];
        return $attributes[$key] ?? $default;
    }

    /**
     * Set category attribute
     */
    public function setAttribute($key, $value)
    {
        $attributes = $this->attributes ?? [];
        $attributes[$key] = $value;
        $this->attributes = $attributes;
        $this->save();
    }
}