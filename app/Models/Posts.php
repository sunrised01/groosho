<?php

namespace App\Models;

use Faker\Core\File;
use Illuminate\Database\Eloquent\Model;

class Posts extends Model
{
    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = [
        'author_id',
        'title',
        'slug',
        'excerpt',
        'content',
        'parent_id',
        'attachment_id',
        'post_type',
        'status',
        'visibility',
        'password',
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

    // Define the relationship with the User (Author)
    public function author()
    {
        return $this->belongsTo(User::class, 'author_id'); 
    }

    public function attchment_data()
    {
        return $this->belongsTo(Files::class, 'attachment_id'); 
    }

    
}
