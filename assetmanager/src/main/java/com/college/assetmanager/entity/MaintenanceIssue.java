@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MaintenanceIssue {

    @Id
    @GeneratedValue
    private UUID id;

    private UUID assetId;

    private UUID reportedBy;

    private String description;

    private String status;

    private UUID technicianId;

    private LocalDateTime createdAt;

    private LocalDateTime resolvedAt;
}