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
        Schema::create('taxonomies', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('taxonomy_name', 32);
            $table->integer('author');
            $table->string('singular_name'); 
            $table->enum('status', ['publish', 'draft', 'trash'])->default('draft'); ; 
            $table->enum('visibility', ['public', 'private', 'protected'])->default('public'); 
            $table->text('description')->nullable();
            $table->string('password')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('taxonomies');
    }
};
