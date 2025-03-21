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
        Schema::create('post_types', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug', 20);
            $table->integer('author');
            $table->string('singular_name'); 
            $table->text('supports'); 
            $table->enum('status', ['publish', 'draft', 'trash'])->default('draft'); ; 
            $table->enum('visibility', ['public', 'private', 'protected'])->default('public'); 
            $table->text('description')->nullable();
            $table->string('password')->nullable();
            $table->integer('is_predefined')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_types');
    }
};
