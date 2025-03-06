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
            $table->unsignedBigInteger('post_author'); 
            $table->text('post_title')->nullable();
            $table->string('post_slug', 200)->nullable();
            $table->text('post_excerpt')->nullable(); 
            $table->text('post_content')->nullable();
            $table->string('post_status', 20)->default('publish');
            $table->unsignedBigInteger('post_parent')->default(0);
            $table->string('post_type', 20)->default('post');
            $table->enum('status', ['publish', 'draft', 'trash'])->default('draft'); ; 
            $table->enum('visibility', ['public', 'private', 'protected'])->default('public'); 
            $table->string('password')->nullable();
            $table->timestamps();
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
