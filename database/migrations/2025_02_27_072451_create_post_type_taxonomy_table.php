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
        Schema::create('post_type_taxonomy', function (Blueprint $table) {
            $table->id();
            $table->foreignId('post_type_id')->constrained('post_types')->onDelete('cascade');
            $table->foreignId('taxonomy_id')->constrained('taxonomies')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('post_type_taxonomy');
    }
};
