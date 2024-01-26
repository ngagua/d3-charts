import { MappedForGroupedData, PieData, USSpendingDataElement } from '../models/models'

export function convert(
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

export function mapDataToInterfaces(
    data: USSpendingDataElement[]
): MappedForGroupedData[] {
    const mappedData = []
    // Group data by year
    const groupedData = data.reduce((acc: any, curr: any) => {
        const year = +curr.year
        if (!acc[year]) {
            acc[year] = []
        }
        acc[year].push(curr)
        return acc
    }, {}) as any[]
    for (const [year, dataArray] of Object.entries(groupedData)) {
        const mappedYear = {
            year: parseInt(year),
            data: dataArray.map((item: USSpendingDataElement) => ({
                department: item.department,
                year: item.year,
                expense: item.expense,
            })),
        }
        mappedData.push(mappedYear)
    }
    return mappedData
}
