import { ApiProperty } from "@nestjs/swagger";

export class UserStatsResponseDto {
  @ApiProperty({ example: 1, description: "Total number of super admins" })
  total_super_admin!: number;

  @ApiProperty({ example: 5, description: "Total number of admins" })
  total_admin!: number;

  @ApiProperty({ example: 10, description: "Total number of operators" })
  total_operator!: number;

  @ApiProperty({ example: 100, description: "Total number of viewers" })
  total_user!: number;

  @ApiProperty({
    example: 2,
    description: "Total number of pending invitations",
  })
  total_pending_invitation!: number;
}
