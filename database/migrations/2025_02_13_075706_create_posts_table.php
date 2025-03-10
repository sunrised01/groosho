<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('posts', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('author_id'); 
            $table->text('title')->nullable();
            $table->string('slug', 200)->nullable();
            $table->text('excerpt')->nullable(); 
            $table->text('content')->nullable();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->unsignedBigInteger('attachment_id')->nullable();
            $table->string('post_type', 20)->default('post');
            $table->enum('status', ['publish', 'draft', 'trash'])->default('draft'); 
            $table->enum('visibility', ['public', 'private', 'protected'])->default('public'); 
            $table->string('password')->nullable();
            $table->timestamps();

            // Define the foreign key constraint for 'author_id'
            $table->foreign('author_id')->references('id')->on('users')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('posts');
    }
};
