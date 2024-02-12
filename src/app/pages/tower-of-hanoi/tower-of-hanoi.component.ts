import { Component, inject, OnInit } from '@angular/core'
import { NgClass } from '@angular/common'
import {
    CdkDrag,
    CdkDragDrop,
    CdkDragMove,
    CdkDropList,
    CdkDropListGroup,
    transferArrayItem,
} from '@angular/cdk/drag-drop'
import { MatInputModule } from '@angular/material/input'
import { FormsModule } from '@angular/forms'
import { MatSelectModule } from '@angular/material/select'
import { Dialog } from '@angular/cdk/dialog'
import { DialogComponent } from '../../shared/dialog/dialog.component'

interface Floor {
    value: number
    color: string
}

@Component({
    standalone: true,
    selector: 'app-tower-of-hanoi',
    templateUrl: './tower-of-hanoi.component.html',
    styleUrls: ['./tower-of-hanoi.component.scss'],
    imports: [
        NgClass,
        CdkDropList,
        CdkDrag,
        CdkDropListGroup,
        MatInputModule,
        FormsModule,
        MatSelectModule,
    ],
})
export class TowerOfHanoiComponent implements OnInit {
    floorNumber = 3
    dialog = inject(Dialog)
    options = [3, 4, 5, 6, 7, 8]
    colors = ['red', 'orange', 'yellow', 'green', 'blue', 'indigo', 'violet', 'pink']
    lockAxis: 'x' | 'y' = 'y'
    towers: Floor[][] = [
        [
            { value: 1, color: 'red' },
            { value: 2, color: 'orange' },
            { value: 3, color: 'yellow' },
        ],
        [],
        [],
    ]

    ngOnInit() {}

    openDialog() {
        const dialogRef = this.dialog.open(DialogComponent, {
            minWidth: '300px',
            data: {},
        })

        dialogRef.closed.subscribe((result) => {
            this.setFloorNumber({ value: this.floorNumber })
        })
    }

    setFloorNumber(event: any) {
        this.floorNumber = event.value
        this.towers = [[], [], []]
        for (let i = 1; i <= this.floorNumber; i++) {
            this.towers[0].push({
                value: i,
                color: this.colors[i - 1],
            })
        }
    }

    drop(event: CdkDragDrop<Floor[]>) {
        if (
            !event.container.data.length ||
            (event.item.data?.value < event.container.data[0]?.value &&
                event.currentIndex === 0)
        ) {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex
            )
        }

        if (
            this.towers[2].length === this.floorNumber ||
            this.towers[1].length === this.floorNumber
        ) {
            this.openDialog()
        }
    }

    onDragMoved(event: CdkDragMove<Floor>) {
        if (event.distance.y < -360) {
            this.lockAxis = 'x'
        } else {
            this.lockAxis = 'y'
        }
    }
}
