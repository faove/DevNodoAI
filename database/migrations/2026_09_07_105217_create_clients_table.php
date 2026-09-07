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
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name');
            $table->string('slug')->unique();
            $table->string('tono')->nullable();
            $table->string('voz')->nullable();
            $table->json('visual_paleta')->nullable();
            $table->string('visual_tipografia')->nullable();
            $table->string('visual_estilo')->nullable();
            $table->json('claims_aprobados')->nullable();
            $table->json('pilares_contenido')->nullable();
            $table->text('oferta')->nullable();
            $table->string('etapa_funnel')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
