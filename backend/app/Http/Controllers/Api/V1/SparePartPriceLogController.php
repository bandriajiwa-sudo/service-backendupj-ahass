<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\SparePartPriceLog;
use Illuminate\Http\Request;

class SparePartPriceLogController extends Controller
{
    public function index(Request $request)
    {
        $logs = SparePartPriceLog::with([
            'shipment.sparePartOrderDetail.sparePart',
            'shipment.shippedBy'
        ])
            ->orderBy('created_at', 'desc')
            ->paginate($request->query('per_page', 50));

        return response()->json([
            'success' => true,
            'data' => $logs->items(),
            'meta' => [
                'current_page' => $logs->currentPage(),
                'per_page' => $logs->perPage(),
                'total' => $logs->total(),
            ],
        ]);
    }
}
