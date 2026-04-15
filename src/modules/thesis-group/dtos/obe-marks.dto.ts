import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsUUID, Max, Min } from "class-validator";

export class CreateOBEMarksDto {
  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  studentId!: string;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  co1!: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  co2!: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  co3!: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  co4!: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4 })
  @IsInt()
  @Min(0)
  @Max(4)
  co5!: number;

  @ApiProperty({ example: "123e4567-e89b-12d3-a456-426614174000" })
  @IsUUID()
  thesisGroupId!: string;
}

export class UpdateOBEMarksDto {
  @ApiProperty({ example: 4, minimum: 0, maximum: 4, required: false })
  @IsInt()
  @Min(0)
  @Max(4)
  co1?: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4, required: false })
  @IsInt()
  @Min(0)
  @Max(4)
  co2?: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4, required: false })
  @IsInt()
  @Min(0)
  @Max(4)
  co3?: number;

  @ApiProperty({ example: 3, minimum: 0, maximum: 4, required: false })
  @IsInt()
  @Min(0)
  @Max(4)
  co4?: number;

  @ApiProperty({ example: 4, minimum: 0, maximum: 4, required: false })
  @IsInt()
  @Min(0)
  @Max(4)
  co5?: number;
}
