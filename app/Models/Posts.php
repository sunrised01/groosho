<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Posts extends Model
{
    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = [
        'post_author',
        'post_title',
        'post_slug',
        'post_excerpt',
        'post_content',
        'post_status',
        'post_parent',
        'post_type',
    ];

    /**
     * Define a one-to-many relationship between the Post model and the PostMeta model.
     * 
     * This method establishes that each post can have many associated postmeta records.
     * The postmeta table will contain metadata for a specific post, and this relationship
     * allows us to retrieve all metadata for a given post easily.
    **/

    public function postMeta()
    {
        return $this->hasMany(PostMeta::class, 'post_id', 'id');
    }
}
