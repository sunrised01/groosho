<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PostType extends Model
{
    use HasFactory;

    /**
     *  Specify the fillable attributes to allow mass assignment.
    **/

    protected $fillable = ['title', 'cpt_name', 'author', 'singular_name', 'supports', 'status', 'visibility', 'password', 'description'];

}

