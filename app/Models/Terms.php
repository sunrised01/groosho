<?php

namespace App\Models;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Terms extends Model
{
    use HasFactory;
    

    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = ['name', 'slug', 'parent_id', 'image_id', 'description'];

    // Define the relationship to get child terms (direct children)
    public function children()
    {
        return $this->hasMany(Terms::class, 'parent_id');
    }

    // Recursive relationship to get all descendants (children, grandchildren, etc.)
    public function childrens()
    {
        return $this->children()->with('childrens')->with('attachmentData');
    }

    // Assuming there's a 'attachment_id' column in the 'terms' table linking to 'files'
    public function attachmentData()
    {
        return $this->belongsTo(Files::class, 'attachment_id');
    }

    
}
