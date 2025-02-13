<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class postmeta extends Model
{
    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/
    protected $fillable = [
        'post_id',
        'meta_key',
        'meta_value',
    ];

    /**
     *  Defining the inverse of the one-to-many relationship
    **/

    public function post()
    {
        return $this->belongsTo(Posts::class, 'post_id', 'id');
    }
}
