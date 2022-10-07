import {Controller, Get, HttpException, HttpStatus, Param} from '@nestjs/common';
import { DemarcheService } from './demarche.service';

@Controller('demarche')
export class DemarcheController {
    constructor(private readonly demarcheService: DemarcheService) {}

    @Get(':id')
    async getDemarche(@Param('id') id: string): Promise<{demarche: Partial<any>}> {
        try {
            return await this.demarcheService.getDemarche(parseInt(id));
        } catch (error) {
            throw new HttpException('Demarche not found', HttpStatus.NOT_FOUND);
        }

    }
}
