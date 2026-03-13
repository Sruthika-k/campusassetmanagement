@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/request")
    public BorrowRequest requestBorrow(@RequestParam UUID assetId,
                                       @RequestParam UUID userId) {
        return borrowService.requestBorrow(assetId, userId);
    }

    @PostMapping("/{id}/approve")
    public BorrowRequest approve(@PathVariable UUID id,
                                 @RequestParam UUID approverId) {
        return borrowService.approveRequest(id, approverId);
    }

    @PostMapping("/{id}/return")
    public BorrowRequest returnAsset(@PathVariable UUID id) {
        return borrowService.returnAsset(id);
    }
}