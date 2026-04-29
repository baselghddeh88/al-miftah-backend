<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement(
                "ALTER TABLE properties MODIFY COLUMN property_type ENUM('apartment','house','villa','shop','land','farm','store') NOT NULL"
            );
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check");
            DB::statement(
                "ALTER TABLE properties ADD CONSTRAINT properties_property_type_check CHECK (property_type IN ('apartment','house','villa','shop','land','farm','store'))"
            );
            return;
        }
    }

    public function down(): void
    {
        $driver = Schema::getConnection()->getDriverName();

        if (in_array($driver, ['mysql', 'mariadb'], true)) {
            DB::statement(
                "ALTER TABLE properties MODIFY COLUMN property_type ENUM('apartment','house','shop','land','farm','store') NOT NULL"
            );
            return;
        }

        if ($driver === 'pgsql') {
            DB::statement("ALTER TABLE properties DROP CONSTRAINT IF EXISTS properties_property_type_check");
            DB::statement(
                "ALTER TABLE properties ADD CONSTRAINT properties_property_type_check CHECK (property_type IN ('apartment','house','shop','land','farm','store'))"
            );
            return;
        }
    }
};
