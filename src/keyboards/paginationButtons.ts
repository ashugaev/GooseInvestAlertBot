import {Markup} from "telegraf";

interface IPaginationButtonsParams {
    page: number,
    itemsPerPage: number,
    itemsLength: number,
}

export const paginationButtons = ({page, itemsPerPage, itemsLength}: IPaginationButtonsParams) => {
    const isFirstPage = page === 0;
    const isLastPage = itemsLength / (page + 1) < itemsPerPage;

    const buttons = [];

    !isFirstPage && (buttons.push(
        Markup.callbackButton(
            `⬅`,
            `prev_page`,
        )
    ));

    !isLastPage && (buttons.push(
        Markup.callbackButton(
            `⮕`,
            `next_page`,
        )
    ));

    return buttons;
}
