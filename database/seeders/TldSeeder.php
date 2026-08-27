<?php

namespace Database\Seeders;

use App\Models\Tld;
use Illuminate\Database\Seeder;

class TldSeeder extends Seeder
{
    public function run(): void
    {
        Tld::create([
            'tld' => 'com',
            'harga_tld' => 150000.00,
            'status_tld' => 1,
            'default' => 1,
        ]);
        Tld::create([
            'tld' => 'net',
            'harga_tld' => 170000.00,
            'status_tld' => 1,
            'default' => 0,
        ]);
    }
}
