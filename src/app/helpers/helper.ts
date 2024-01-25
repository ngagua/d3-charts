import { PieData } from '../models/models'

export class PieHelper {
    static convert(
        data: any,
        title: string,
        valueAttr: string,
        idAttr: string,
        labelAttr: string
    ): PieData {
        const pieData = (data || []).map((element: any) => ({
            id: element[idAttr],
            label: element[labelAttr],
            value: element[valueAttr],
        }))
        return {
            title,
            data: pieData,
        }
    }
}
