import React, { useState } from "react";

import { Box } from "$/components/Box/Box";
import { Button } from "$/components/Button/Button";
import { Divider } from "$/components/Divider/Divider";
import { Flex } from "$/components/Flex/Flex";
import { ActionDefinition } from "$/modules/actions/models/action_models";

import styles from "./ActionsList.module.css";

export type ActionsListProps = {
  actions: ActionDefinition[];
  onActionSelected: (actionId: string) => void;
};

/**
 * Component to display available actions and handle action selection
 */
export const ActionsList: React.FC<ActionsListProps> = ({
  actions,
  onActionSelected,
}) => {
  const [showAllActions, setShowAllActions] = useState(false);

  // Get highlighted actions
  const highlightedActions = actions.filter((action) => {
    return action.highlight === true;
  });

  // Determine which actions to show
  const visibleActions = showAllActions
    ? actions
    : highlightedActions.length > 0
      ? highlightedActions
      : actions.slice(0, 5);

  return (
    <Box className={styles.actionsContainer}>
      <Flex justify="between" align="center" className={styles.actionsHeader}>
        <h4 className={styles.actionsTitle}>Available Actions</h4>
        <Button
          size="sm"
          color="tertiary"
          onClick={() => {
            return setShowAllActions(!showAllActions);
          }}
        >
          {showAllActions ? "Show Suggested" : "Show All"}
        </Button>
      </Flex>

      <Divider />

      <Flex
        direction="row"
        wrap="wrap"
        gap="xs"
        className={styles.actionButtons}
      >
        {visibleActions.map((action) => {
          return (
            <Button
              key={action.id}
              size="sm"
              color={action.highlight ? "primary" : "secondary"}
              onClick={() => {
                return onActionSelected(action.id);
              }}
              className={styles.actionButton}
              aria-label={action.description}
            >
              {action.name}
            </Button>
          );
        })}

        {visibleActions.length === 0 && (
          <Box className={styles.noActions}>
            No actions available for this selection type
          </Box>
        )}
      </Flex>
    </Box>
  );
};
